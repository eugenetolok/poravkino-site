#!/usr/bin/env python3
import os
import uuid
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from yookassa import Configuration, Receipt, Payment, Refund

# ---------- НАСТРОЙКИ ----------
DAYS_TO_CHECK = 30  # за сколько дней искать отменённые чеки
# В .env: YOOKASSA_SHOP_ID, YOOKASSA_API_KEY, опц. DEFAULT_RECEIPT_EMAIL
# -------------------------------

# ==== Утилиты безопасного доступа (obj | dict) ====
def g(obj, key, default=None):
    """Безопасно взять поле key из объекта SDK или dict."""
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)

def has_method(obj, name):
    return hasattr(obj, name) and callable(getattr(obj, name))

def to_dict_any(obj) -> dict:
    """Преобразовать объект SDK в dict; если уже dict — вернуть как есть."""
    if obj is None:
        return {}
    if isinstance(obj, dict):
        return obj
    if has_method(obj, "to_dict"):
        return obj.to_dict()
    # Попытка «грубого» преобразования
    try:
        return dict(obj)
    except Exception:
        return {}

# ==== Конфигурация ====
def configure_from_env() -> bool:
    load_dotenv()
    shop_id = os.getenv("YOOKASSA_SHOP_ID")
    api_key = os.getenv("YOOKASSA_API_KEY")
    if not shop_id or not api_key:
        print("[!] YOOKASSA_SHOP_ID и/или YOOKASSA_API_KEY не заданы (файл .env).")
        return False
    Configuration.configure(shop_id, api_key)
    print(f"[*] Конфигурация загружена. Shop ID: {shop_id}")
    return True

# ==== Контакты клиента ====
def get_customer_contact_from_payment(payment_id: str | None) -> dict | None:
    if not payment_id:
        return None
    try:
        p = Payment.find_one(payment_id)
        receipt = g(p, "receipt")
        customer = g(receipt, "customer") if receipt else None
        out = {}
        email = g(customer, "email")
        phone = g(customer, "phone")
        if email: out["email"] = email
        if phone: out["phone"] = phone
        if not out and g(p, "metadata") and "email" in p.metadata:
            out = {"email": p.metadata["email"]}
        return out or None
    except Exception as e:
        print(f"[!] Ошибка при получении платежа {payment_id}: {e}")
        return None

def build_customer_for_receipt(receipt_like) -> dict:
    default_email = os.getenv("DEFAULT_RECEIPT_EMAIL")
    contact = get_customer_contact_from_payment(g(receipt_like, "payment_id"))
    if contact:
        return contact
    if default_email:
        return {"email": default_email}
    print("[-] Нет email/phone клиента (и DEFAULT_RECEIPT_EMAIL не задан). Чек будет без адресата.")
    return {}

# ==== Дозагрузка полных данных чека ====
def load_full_receipt_dict(receipt_stub) -> dict:
    """
    Гарантированно получаем dict «полного» чека через Receipt.find_one(id).
    Если id не удаётся определить или find_one упал — возвращаем то, что есть.
    """
    stub = to_dict_any(receipt_stub)
    rid = stub.get("id") or g(receipt_stub, "id")
    if not rid:
        # некоторые SDK-объекты содержат поле 'receipt_id' — проверим и его
        rid = stub.get("receipt_id") or g(receipt_stub, "receipt_id")
    try:
        if rid:
            full = Receipt.find_one(rid)
            return to_dict_any(full) or stub
    except Exception as e:
        print(f"[-] Не удалось загрузить полный чек {rid}: {e}")
    return stub

# ==== Подтягивание items/amount из Payment/Refund ====
def items_from_payment(payment_id: str | None) -> list:
    if not payment_id:
        return []
    try:
        p = Payment.find_one(payment_id)
        pr = g(p, "receipt")
        items = g(pr, "items") if pr else None
        if items:
            return [to_dict_any(it) for it in items]
    except Exception as e:
        print(f"[-] Не удалось получить items из платежа {payment_id}: {e}")
    return []

def amount_from_payment(payment_id: str | None) -> dict | None:
    if not payment_id:
        return None
    try:
        p = Payment.find_one(payment_id)
        amt = g(p, "amount")
        val = g(amt, "value")
        cur = g(amt, "currency")
        if val is not None and cur:
            return {"value": str(val), "currency": str(cur)}
    except Exception as e:
        print(f"[-] Не удалось получить amount из платежа {payment_id}: {e}")
    return None

def items_amount_from_refund(refund_id: str | None) -> tuple[list, dict] | tuple[None, None]:
    if not refund_id:
        return None, None
    try:
        r = Refund.find_one(refund_id)
        amt = g(r, "amount")
        amount = None
        if amt and g(amt, "value") is not None and g(amt, "currency"):
            amount = {"value": str(g(amt, "value")), "currency": str(g(amt, "currency"))}
        rec = g(r, "receipt")
        items = g(rec, "items") if rec else None
        items = [to_dict_any(it) for it in items] if items else []
        return items, amount
    except Exception as e:
        print(f"[-] Не удалось получить Refund {refund_id}: {e}")
        return None, None

# ==== Извлечение позиций и суммы для повторной отправки ====
def extract_items_and_amount(receipt_like) -> tuple[list, dict] | None:
    data = load_full_receipt_dict(receipt_like)

    # 1) Из самого чека: items + settlements[0].amount
    items = data.get("items") or []
    settlements = data.get("settlements") or []
    amount = None
    if settlements:
        a = settlements[0].get("amount") or {}
        if "value" in a and "currency" in a:
            amount = {"value": str(a["value"]), "currency": str(a["currency"])}

    r_type = data.get("type") or g(receipt_like, "type", "payment")
    payment_id = data.get("payment_id") or g(receipt_like, "payment_id")
    refund_id = data.get("refund_id") or g(receipt_like, "refund_id")

    # 2) Если чего-то не хватает — добираем из Payment/Refund
    if not items:
        cand_items = items_from_payment(payment_id)
        if cand_items:
            items = cand_items

    if not amount:
        if r_type == "refund" or refund_id:
            _, amount_from_ref = items_amount_from_refund(refund_id)
            if amount_from_ref:
                amount = amount_from_ref
        if not amount:
            cand_amt = amount_from_payment(payment_id)
            if cand_amt:
                amount = cand_amt

    if not amount or not items:
        return None
    return items, amount

# ==== Сборка payload ====
def build_payload_from_canceled(receipt_stub) -> dict | None:
    data = load_full_receipt_dict(receipt_stub)

    r_type = data.get("type") or g(receipt_stub, "type", "payment")
    payment_id = data.get("payment_id") or g(receipt_stub, "payment_id")
    refund_id = data.get("refund_id") or g(receipt_stub, "refund_id")

    parsed = extract_items_and_amount(receipt_stub)
    if not parsed:
        print(f"[-] Пропуск: нет корректных settlements/items (receipt_id={data.get('id')})")
        return None
    items, amount = parsed
    customer = build_customer_for_receipt(receipt_stub)

    if r_type == "refund" or refund_id:
        payload = {
            "type": "refund",
            "send": True,
            "customer": customer,
            "items": items,
            "settlements": [{"type": "prepayment", "amount": amount}],
        }
        if refund_id:
            payload["refund_id"] = refund_id
        elif payment_id:
            payload["payment_id"] = payment_id
        else:
            print(f"[-] Пропуск refund-чека без refund_id и payment_id (receipt_id={data.get('id')})")
            return None
        return payload

    # чек прихода
    if not payment_id:
        print(f"[-] Пропуск приходного чека без payment_id (receipt_id={data.get('id')})")
        return None

    return {
        "type": "payment",
        "send": True,
        "payment_id": payment_id,
        "customer": customer,
        "items": items,
        "settlements": [{"type": "cashless", "amount": amount}],
    }

# ==== Основной поток ====
def main():
    print("--- Повторная отправка чеков ЮKassa ---")
    if not configure_from_env():
        return

    end_dt = datetime.now(timezone.utc)
    start_dt = end_dt - timedelta(days=DAYS_TO_CHECK)
    created_at_gte = start_dt.isoformat()

    print(f"[*] Поиск отменённых чеков с {start_dt.strftime('%Y-%m-%d')} по сегодня...")
    try:
        receipts_response = Receipt.list({
            "status": "canceled",
            "created_at.gte": created_at_gte,
            "limit": 100
        })
    except Exception as e:
        print(f"[!] Ошибка запроса к API ЮKassa: {e}")
        return

    canceled = g(receipts_response, "items", []) or []
    print(f"[+] Найдено отменённых чеков: {len(canceled)}")

    to_resend = []
    for r in canceled:
        payload = build_payload_from_canceled(r)
        if payload:
            to_resend.append(payload)

    if not to_resend:
        print("[*] Нет чеков для повторной отправки после фильтрации. Завершено.")
        return

    print("\n" + "=" * 60)
    print(f"ПЛАН: создать и отправить {len(to_resend)} чек(ов)")
    print("=" * 60)
    for p in to_resend:
        who = f"refund_id={p.get('refund_id')}" if p.get("type") == "refund" and p.get("refund_id") else f"payment_id={p.get('payment_id')}"
        cust = p.get("customer", {}) or {}
        cstr = ", ".join([f"{k}={v}" for k, v in cust.items()]) if cust else "—"
        amt = p["settlements"][0]["amount"]
        print(f"- type={p['type']}, {who}, items={len(p['items'])}, amount={amt['value']} {amt['currency']}, customer: {cstr}")

    ans = input("\nПродолжить отправку? (y/n): ").strip().lower()
    if ans != "y":
        print("[*] Операция отменена пользователем.")
        return

    print("\n[*] Отправляю...")
    ok = 0
    fail = 0
    for p in to_resend:
        try:
            res = Receipt.create(p, str(uuid.uuid4()))  # идемпотентность
            ref = p.get("refund_id") or p.get("payment_id") or "n/a"
            print(f"[+] OK: {ref} -> чек {res.id} (status={res.status})")
            ok += 1
        except Exception as e:
            ref = p.get("refund_id") or p.get("payment_id") or "n/a"
            print(f"[!] FAIL: {ref} -> {e}")
            fail += 1

    print("\n--- Отчёт ---")
    print(f"Успешно: {ok}")
    print(f"Ошибок : {fail}")
    print("--------------")

if __name__ == "__main__":
    main()
