var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazonDB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
});


var itemPrice;

// display items for sale functions

function run() {
  connection.query('SELECT * FROM products', function (err, results) {
    if (err) throw err;

    for (i = 0; i < results.length; i++) {
      console.log('ID:' + results[i].id +
        ' Product: ' + results[i].product_name +
        ' Price: ' + '$' + results[i].price +
        '(Amount remaining: ' + results[i].stock_quantity + ')')
    }

    start();
  })
}
// function to prompt user

function start() {
  inquirer.prompt([{
    name: 'selectItem',
    message: "What is the ID of the item you want to purchase?",
  }, {
    name: 'quantity',
    message: 'How many would you like to order?',

  }]).then(function (answer) {
    connection.query('SELECT * FROM products WHERE id = ?', [answer.selectItem], function (err, results) {
      if (answer.quantity > results[0].stock_quantity) {
        console.log('Sorry, come back with more money');
        console.log('This order has been cancelled');
        newOrder();
      }
      else {
        itemPrice = results[0].price * answer.quantity;
        console.log('Thanks for your order');
        console.log('Total price is $' + itemPrice);

        connection.query('UPDATE products SET ? Where ?', [{
          stock_quantity: results[0].stock_quantity - answer.quantity
        }, {
          id: answer.selectItem
        }], function (err, results) { });
        newOrder();
      }
    })

  }, function (err, results) { })
};

// new order function

function newOrder() {
  inquirer.prompt([{
    type: 'confirm',
    name: 'choice',
    message: 'Would you like to buy something else?'
  }]).then(function (answer) {
    if (answer.choice) {
      start();
      run();
    }
    else {
      console.log('Thank you for shopping!');
      connection.end();
    }
  })
};


run();
