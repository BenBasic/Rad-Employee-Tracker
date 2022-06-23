// Requirement which allows inquirer package to be used with node.js
const { connect } = require("http2");
const inquirer = require("inquirer");
const { first } = require("lodash");
// Requirement allows running databases within server
const mysql = require('mysql2');
const { createConnection } = require("net");
// Requirement allows printing console data as a table
require("console.table");
// Setting up the port, will run in process environment port, if local it will be 30001
const PORT = process.env.PORT || 3001;

let roleChoicesArray = [];
let managerChoicesArray = [];
let employeeChoicesArray = [];

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

// Connects to the database
db.connect(function (err) {
    if (err) throw err;
    console.log("Welcome to the Rad Employee Tracker! I hope you're having a nice day!")

});

// Function to prompt the main menu of the program which will guide user to different functions of the app
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
                "Add an Employee",
                "Update an employee role",
                "Exit Program"
            ]
        }
    ])

    // Adding switch cases to run functions based on what choice is selected
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

            case "Add an Employee":
                addEmployee();
                break;
            
            case "Update an employee role":
                CoolEmployee();
                break;

            case "Exit Program":
                db.end();
                break;
            
        }
    });
}

// Views all departments when selected by the user
function viewDeparments() {
    // Selecting the name property from the departments table 
    db.query("SELECT name FROM department;",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

// Views all roles when selected by the user
function viewRoles() {
    // Selects everything from the role table
    db.query("SELECT * FROM role",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

// Views all employees when selected by the user
function viewEmployees() {
    // Selecting and joining table data to display the employees
    db.query("SELECT employee.id AS Id, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

// Views all employees and sorts them by department when selected by the user
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

// Views all managers when selected by the user
function viewManagers() {
    // Selecting id, first name, and last name properties from the employee table where the id from the employee's manager id column is a value of null
    db.query("SELECT id, first_name, last_name FROM Employee WHERE id IN (SELECT manager_id FROM employee WHERE manager_id IS NOT NULL);",
    function(err, result) {
        if (err) throw err;

        console.table(result);
        mainMenu();
    });
}

// Adds a department when selected by the user
function addDepartment() {

    // Starting prompts for user to create their department
    inquirer.prompt([
        {
          name: "name",
          type: "input",
          message: "Enter the name of the department you would you like to add",
          validate: function (answer) {
            // If user doesnt type anything, it will log that the user needs to enter a valid name
            if (answer.length < 1) {
                return console.log("Please type in a valid department name");
            }
            return true;
          }
        }
    ])
    .then(function (answer) {
        // Inserts the name of the department into the department table
        db.query('INSERT INTO department (name) VALUES (?)', answer.name, function (err, results) {
            if (err) throw err;
            console.log(answer.name + " department successfully added.");
            mainMenu();
        });
    })
};

// Adds a role when selected by the user
function addRole() { 
    // Selects everything from the department table
    db.query("SELECT * FROM department",   function(err, results) {
        // Prompts for user to add their role
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
                // If user doesnt type anything, it will log that the user needs to enter a valid salary
                if (answer.length < 1) {
                    return console.log("Please type in a valid salary amount");
                }
                return true;
                }
            },
            {
                name: "role_department",
                type: "list",
                message: "What department does this role belong to?",
                choices: function() {
                    // Assigning departmentChoiceArray to an empty array to be populated later
                    let departmentChoiceArray = [];
                    // For loop that iterates through the items in results, then pushes the name values into the departmentChoiceArray array
                    for (let i = 0; i < results.length; i++) {
                        departmentChoiceArray.push(results[i].name)
                    }
                    return departmentChoiceArray;
                } 
            }
        ])
      .then(function(result) {
        // Assigning variable to empty array for later population
        let departmentPick = [];
        // Assigning variable to the title of the role's department
        let departmentTitle = result.role_department;
        // Assigning variable to the salary of the role's salary
        let roleSalary = result.role_salary;
        //// Assigning variable to the name of the role_name
        let roleName = result.role_name;

        // Selecting id from the department table where the name equals departmentTitle
        db.query("SELECT id FROM department WHERE name = ?", departmentTitle, function (err, results) {
            if (err) throw err;
            // Assigning departmentPick to the id of results
            departmentPick = results[0].id;

            // Inserts object of role data into the role table
            db.query("INSERT INTO role SET ?",
                {
                title: roleName,
                salary: roleSalary,
                department_id: departmentPick
                },
                function(err, result) {
                    if (err) throw err;

                    
                    console.log(departmentTitle + " has been added to the list of roles")
                    mainMenu();
                })
            })
        });
    });
}


// Adds an employee when selected by the user
function addEmployee() {
  
    // Selecting role's id, title, and salary from role table
    const query ="SELECT r.id, r.title, r.salary FROM role r"
  
    db.query(query, function (err, res) {
      if (err) throw err;
  
      // Mapping out properties from res and assigning them values
      const roleChoices = res.map(({ id, title, salary }) => ({
        value: `${title}`, title: `${id}`, salary: `${salary}`
      }));
  
      // Calls the addEmployeePrompt to begin prompts with roleChoices data
      addEmployeePrompt(roleChoices);
    });
}
  

// Loads choices for managers to select from
function managerChoices() {
    // Selects first name and last name from employee table where manager_id is NULL because only managers have NULL values for that
    db.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function(err, result) {
        
        if (err) throw err;
        // For loop to iterate through result and push the first_name property into managerChoiceArray
        for (let i = 0; i < result.length; i++) {
            managerChoicesArray.push(result[i].first_name);
        }
    })
    return managerChoicesArray;
}


// Prompts for addEmployee which then adds them to the database
function addEmployeePrompt(roleChoices) {
    
    inquirer.prompt([
      {
        name: "newEmployee",
        type: "input",
        message: "Enter the first and last name of the employee you would you like to add"
      },
      {
        name: "newRole",
        type: "list",
        message: "Select which role this employee has",
        choices: roleChoices
      },
      {
        name: "newManager",
        type: "list",
        message: "Select this employee's manager",
        choices: managerChoices()
      }
    ])
    .then(function (answer) {
        // Assigning variable to be a split up array of the value the user entered for newEmployee so it can be referenced later
        let firstLastName = answer.newEmployee.split(" ");
        // Assigning rolePick to nothing so it can be added to later
        let rolePick;
        // For loop iterating through roleChoices tp check if the name is equal to the selected role, then it assigns rolePick variable
        for (var i=0; i<roleChoices.length; i++) {

            if (roleChoices[i].value == answer.newRole) {
            rolePick = roleChoices[i].title
            }
        }

        // Assigning managerPick to empty array so it can be populated later
        let managerPick = [];

        // Selecting id from employee table where first name equals the name of the manager the user selected
        db.query("SELECT id FROM employee WHERE first_name = ?", answer.newManager, function (err, results) {
            if (err) throw err;
            // Assigns manager pick to the id property of the result
            managerPick = results[0].id;

            // Inserts object into employee table
            db.query("INSERT INTO employee SET ?",
            {
                first_name: firstLastName[0],
                last_name: firstLastName[1],
                role_id: rolePick,
                manager_id: managerPick,
            },
            function (err, result) {
                if (err) throw err;
                
    
                console.log(answer.newEmployee + " has been added to the list of employees")
                mainMenu();
            });
        })
    })
};



// Updates user role when user selects it from the menu
function CoolEmployee() {
  
    // Selecting role id, title, and salary from role table
    const query ="SELECT r.id, r.title, r.salary FROM role r"
  
    db.query(query, function (err, res) {
      if (err) throw err;
  
      // Mapping out properties from res and assigning them values
      const roleChoices = res.map(({ id, title, salary }) => ({
        value: `${title}`, title: `${id}`, salary: `${salary}`
      }));
      
      // Selecting first name and last name from employee table
      db.query("SELECT first_name, last_name FROM employee", function (err, res) {
          if (err) throw err;
          
          // Mapping out properties from res and assigning them values
          const employeeMapArray = res.map(({ first_name, last_name }) => ({
            value: `${first_name}`, title: `${last_name}`
          }));

          // Calls the updateEmployeePrompt to begin prompts with employeeMapArray and roleChoices data
          updateEmployeePrompt(employeeMapArray,roleChoices);
      });
    });
}

// Prompts for updating employee role, will then update information in database
function updateEmployeePrompt(employeeMapArray,roleChoices) {
    
    inquirer.prompt([
      {
        name: "employeeCheckList",
        type: "list",
        message: "Select which employee you'd like to change the role of",
        choices: employeeMapArray
      },
      {
        name: "employeeCheckRole",
        type: "list",
        message: "Select the employee's new role",
        choices: roleChoices
      }
    ])
    .then(function (answer) {
        // Assigning rolePick to nothing to be assigned later
        let rolePick;
        // For loop iterating through roleChoices tp check if the name is equal to the selected role, then it assigns rolePick variable
        for (var i=0; i<roleChoices.length; i++) {

            if (roleChoices[i].value == answer.employeeCheckRole) { //do something here }
            rolePick = roleChoices[i].title
            }
        }

        // Assigning name properties for employee to arrays which will be filled later
        let firstNamePick = [];
        let lastNamePick = [];
        
        // Selecting first name and last name from employee table where first name matches employee selected by user
        db.query("SELECT first_name, last_name FROM employee WHERE first_name = ?", answer.employeeCheckList, function (err, results) {
            if (err) throw err;
            // Assigning name's to the name properties from results
            firstNamePick = results[0].first_name;
            lastNamePick = results[0].last_name;

            // Updates employee table to set the role id to rolePick where first name equals firstNamePick
            db.query("UPDATE employee SET role_id = ? WHERE first_name = ? ", [rolePick, firstNamePick], (err, res) => {
                if (err) throw err;
                console.log("Employee role updated");
                mainMenu();

            });
        })
    })
};

mainMenu();