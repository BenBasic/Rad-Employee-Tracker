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
      database: 'employeeDB'
    },
    console.log(`Connected to the employeeDB database.`)
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
    /* Selects role title, role salary, and repartment name properties from role table, renames department.name to Department on result table.
    Then joins the department table's results where it will not display multiple table items with the same value, making it so that the resulting role table displays single roles instead of duplicates
    */
    db.query("SELECT role.title, role.salary, department.name AS Department FROM role JOIN department ON role.id = department.id;",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

function viewEmployees() {
    /* Selecting the first name and last name properties from the employee table, the title and salary properties from the role table, the name property from the department table.
    Then renaming employee table to manager table, while selecting records that have matching role values in Role and Employee tables, and department values in department table and role table.
    Then returning all matching employee id values on tables with manger_id and id properties
    */
    db.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id;",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

function viewEmployeesDepartment() {
    /* Selects employee first name, employee last name, and department name properties from employee table, renames department.name to Department.
    Then joins role tables results and department table results checking for matching id values to display the department name column and then order the displayed results by department name in alphabetical order
    */
    db.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY department.name;",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

function viewManagers() {
    // Selecting id, first name, and last name properties from the employee table where the id from the employee's manager id column is a value of null
    db.query("SELECT id, first_name, last_name FROM Employee WHERE id IN (SELECT manager_id FROM employee WHERE manager_id IS NOT NULL);",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

function addDepartment() {

    inquirer.prompt([
        {
          name: "name",
          type: "input",
          message: "Enter the name of the department you would you like to add",
          validate: function (answer) {
            if (answer.length < 1) {
                return console.log("Please type in a valid department name");
            }
            return true;
          }
        }
    ])
    .then(function (answer) {
        db.query('INSERT INTO department (name) VALUES (?)', answer.name, function (err, results) {
            if (err) throw err;
            console.log(answer.name + " department successfully added.");
            mainMenu();
        });
    })
};

function addRole() { 
    db.query("SELECT role.title AS Title, role.salary AS Salary FROM role",   function(err, results) {
      inquirer.prompt([
          {
            name: "role_name",
            type: "input",
            message: "Enter the name of the role you would you like to add",
            validate: function (answer) {
                if (answer.length < 1) {
                    return console.log("Please type in a valid role name");
                }
                return true;
                }
            },
          {
            name: "role_salary",
            type: "input",
            message: "What is the yearly salary of the role you would like to add?",
            validate: function (answer) {
                if (answer.length < 1) {
                    return console.log("Please type in a valid salary amount");
                }
                return true;
                }
            } 
        ])
      .then(function(result) {
          db.query(
              "INSERT INTO role SET ?",
              {
                title: result.role_name,
                salary: result.role_salary,
              },
              function(err) {
                  if (err) throw err
                  console.table(result);
                  mainMenu();
                }
            )
        });
    });
}


mainMenu();