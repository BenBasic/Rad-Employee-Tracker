// Requirement which allows inquirer package to be used with node.js
const { connect } = require("http2");
const inquirer = require("inquirer");
// Requirement allows running databases within server
const mysql = require('mysql2');
const { createConnection } = require("net");
// Requirement allows printing console data as a table
require("console.table");
// Setting up the port, will run in process environment port, if local it will be 30001
const PORT = process.env.PORT || 3001;

// Creates pathway to the database
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: '12345',
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
            type: "list",
            message: "What would you like to do?",
            name: "menu",
            choices: 
            [
                "View all departments",
                "View all roles",
                "View all employees",
                "View employees by department",
                "View all managers",
                "Add a department",
                "Add a role",
                "Update an employee role",
                "Update employee managers",
                "Delete department",
                "Delete role",
                "Delete employee",
                "Exit Program"
            ]
        }
    ])

    .then(function(answer) {
        switch (answer.menu) {
            case "View all departments":
                viewDeparments();
                break;

            case "View all roles":
                viewRoles();
                break;

            case "View all employees":
                viewEmployees();
                break;

            case "View employees by department":
                viewEmployeesDepartment();
                break;
            
            case "View all managers":
                viewManagers();
                break;

            case "Add a department":
                addDepartment();
                break;

            case "Add a role":
                addRole();
                break;

            case "Update an employee role":
                updateRole();
                break;
            
            case "Update employee managers":
                updateManagers();
                break;

            case "Delete department":
                deleteDepartment();
                break;

            case "Delete role":
                deleteRole();
                break;
            
            case "Delete employee":
                deleteEmployee();
                break;

            case "Exit Program":
                db.end();
                break;
            
        }
    });
}

function viewDeparments() {
    // Selecting the name property from the departments table 
    db.query("SELECT name FROM department;",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

function viewRoles() {
    /* Selecting the first name and last name properties from the employee table, the title and salary properties from the role table, the name property from the department table.
    Then renaming employee table to manager table, while selecting records that have matching role values in Role and Employee tables, and department values in department table and role table.
    Then returning all matching employee id values on tables with manger_id and id properties
    */
    db.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, AS Manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id left join employee e ON employee.manager_id = e.id;",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

function viewEmployees() {
    // Selecting the name property from the departments table 
    db.query("SELECT name FROM department;",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}


mainMenu();