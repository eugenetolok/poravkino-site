package poravkino

// const stringBadProccessign = `<!DOCTYPE html>
// <html>
// <head>
// <style>
//   h1 {
// 	color: white;
// 	position: absolute;
// 	top: 50%;
// 	left: 50%;
// 	transform: translate(-50%, -50%);
//   }
//   body {
// 	background-color: #121212;
//   }
// </style>
//   <script>
// 	window.onload = function() {
// 	  setTimeout(function(){
// 		window.location.href = "/tickets";
// 	  }, 3000);
// 	}
//   </script>
// </head>
// <body>
//   <div class="text-center">
// 	<h1>Проверка оплаты, перенаправление...</h1>
//   </div>
// </body>
// </html>`

const stringSaleNotFound = `<!DOCTYPE html>
<html>
<head>
<style>
  div {
	color: white;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
  }
  body {
	background-color: #121212;
  }
</style>
</head>
<body>
  <div class="text-center">
	<h1>Продажа не найдена, обратитесь в поддержку</h1>
	<h3>При обращении укажите последние 4 цифры карты, дату покупки, а также код из письма Сбербанка</h3>
	<a href="/">Главная</a>
  </div>
</body>
</html>`
