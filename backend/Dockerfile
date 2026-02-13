FROM alpine

WORKDIR /poravkino

COPY ./bin/poravkino ./pkg/smtp/template.htm ./
COPY ./dist ./dist

EXPOSE 7777

CMD ["./poravkino"]