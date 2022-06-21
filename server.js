// Requirement which allows inquirer package to be used with node.js
const { connect } = require("http2");
const inquirer = require("inquirer");
// Requirement allows running databases within server
const mysql = require('mysql2');
// Requirement allows printing console data as a table
require("console.table");
// Setting up the port, will run in process environment port, if local it will be 30001
const PORT = process.env.PORT || 3001;

// Creates pathway to the database
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'Remember To Put A Password Here',
      database: 'company_db'
    },
    console.log(`Connected to the company_db database.`)
);

db.connect(function (err) {
    if (err) throw err;
    console.log("Welcome to the Rad Employee Tracker! I hope you're having a nice day!")

});

function mainMenu() {
    inquirer.prompt([
        {
            
        }
    ])
}