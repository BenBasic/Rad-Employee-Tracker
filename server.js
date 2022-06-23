// Requirement which allows inquirer package to be used with node.js
const { connect } = require("http2");
const inquirer = require("inquirer");
const { first } = require("lodash");
// Requirement allows running databases within server
const mysql = require('mysql2');
// const mysql = require('mysql2/promise');
const { createConnection } = require("net");
// Requirement allows printing console data as a table
require("console.table");
// Setting up the port, will run in process environment port, if local it will be 30001
const PORT = process.env.PORT || 3001;

let roleChoicesArray = [];
let managerChoicesArray = [];

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

// async function connectionStart() {
//     const db = await mysql.createConnection(
//         {host:'localhost',
//         user: 'root',
//         password: '12345',
//         database: 'employeeDB',
//         Promise: bluebird
//         },
//         console.log("IT CONNECTED")
//     );
// }
// connectionStart();


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
                "Add an Employee",
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

            case "Add an Employee":
                addEmployee();
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
    // Selects everything from the role table
    db.query("SELECT * FROM role",
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
    db.query("SELECT * FROM department",   function(err, results) {
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
            },
            {
                name: "role_department",
                type: "list",
                message: "What department does this role belong to?",
                choices: function() {
                    let departmentChoiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                        departmentChoiceArray.push(results[i].name)
                    }
                    return departmentChoiceArray;
                } 
            }
        ])
      .then(function(result) {
        let departmentPick = [];
        let departmentTitle = result.role_department;
        let roleSalary = result.role_salary;
        let roleName = result.role_name;

        db.query("SELECT id FROM department WHERE name = ?", departmentTitle, function (err, results) {
            if (err) throw err;
            departmentPick = results[0].id;
            console.log("LOOK! result.role_department is: " + result.role_department)
            console.log("LOOK! departmentPick is: " + departmentPick)
            console.log("LOOK! departmentTitle is: " + departmentTitle)
            console.log("LOOK! departmentSalary is: " + roleSalary)
            console.log("LOOK! roleName is: " + roleName)
            // Maybe have }) here instead of below the other db.query after this

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

/*
function roleChoices() {
    console.log("INSIDE ROLE CHOICES")
    db.query("SELECT * FROM role", function(err, result) {
        console.log(result)
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            roleChoicesArray.push(result[i].title);
        }
    })
    console.log(roleChoicesArray)
    return roleChoicesArray;
}
*/
// roleChoices();

// Make a employee array
function addEmployee() {
    console.log("Inserting an employee!")
  
    const query ="SELECT r.id, r.title, r.salary FROM role r"
  
    db.query(query, function (err, res) {
      if (err) throw err;
  
      const roleChoices = res.map(({ id, title, salary }) => ({
        value: `${title}`, title: `${id}`, salary: `${salary}`
      }));
      console.log('here is title: ', roleChoices[2].title)
      console.table(res);
      console.log("TEST TEST TEST: " + roleChoices)
      console.log("RoleToInsert!");
  
      testPrompt(roleChoices);
    });
  }
  



function managerChoices() {
    console.log("INSIDE MANAGER CHOICES")
    db.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function(err, result) {
        
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            managerChoicesArray.push(result[i].first_name);
        }
    })
    return managerChoicesArray;
}



function testPrompt(roleChoices) {
    
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
        console.log("INSIDE OF THEN STATEMENT")
        let firstLastName = answer.newEmployee.split(" ");
        console.log("IT GOT THIS FAR")
        console.log(roleChoices)
        console.log("answer.newRole is: " + answer.newRole)
        //let rolePick = roleChoices; //let obj = arr.find(o => o.name === 'string 1');
        let rolePick;
        for (var i=0; i<roleChoices.length; i++) {
            console.log("FOR LOOP CHECK")
            console.log(roleChoices[i].value)
            console.log(answer.newRole)

            if (roleChoices[i].value == answer.newRole) { //do something here }
            rolePick = roleChoices[i].title
            console.log("ROLE PICK IS///")
            console.log(rolePick)
            }
        }

        
        console.log("ROLE PICK 2 IS///")
        console.log(rolePick)
        console.log("IT GOT THIS FAR2")
        let managerPick = [];
        console.log("IT GOT THIS FAR3")
        

        db.query("SELECT id FROM employee WHERE first_name = ?", answer.newManager, function (err, results) {
            console.log("INSIDE OF QUERY")
            if (err) throw err;
            managerPick = results[0].id;
            console.log(managerPick)
            console.log(rolePick)

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



function updateRole() {

    db.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, e2.first_name AS manager FROM employee LEFT JOIN employee AS e2 ON e2.id = employee.manager_id JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id"), function (err, results) {
        if (err) throw err;
    
        
        inquirer.prompt([
            {
                name: "employeeList",
                type: "list",
                message: "Which employee do you want to update the role of?",
                choices: function() {
                    let employeeChoiceList = [];
                    for (let i = 0; i < results.length; i++) {
                        employeeChoiceList.push(results[i].first_name);
                    }
                    return employeeChoiceList;
                }
            }
        ])
        .then(function(answer) {
            let employeeFirstName = answer.employeeList;

            db.query("SELECT * FROM role", function (err, result) {
                if (err) throw err;
                inquirer.prompt([
                    {
                        name: "roleList",
                        type: "list",
                        message: "What role do you want to apply to this employee?",
                        choices: function() {
                            let roleChoiceList = []; //Unsure if having this locally scoped is the problem as other arrays are globally scoped I used in other blocks, but making this globally scoped didnt seem to fix the error
                            console.log(result[0].title);
                            console.log(result.length);
                            for (let i = 0; i < result.length; i++) {
                                roleChoiceList.push(result[i].title);
                                console.log("ROLECHOICELIST CHECK: " + roleChoiceList)
                                console.log("RESULT[i].TITLE CHECK: " + result[i].title)
                            }
                            return roleChoiceList;
                        }
                    }
                ])
                .then(function(answer) {
                    let employeeRole = answer.roleList;
                    console.log("DID IT MAKE IT? " + employeeRole);
                    db.query("SELECT * FROM role WHERE title = ?", employeeRole, function (err, results) {
                        if (err) throw err;
                        newRoleID = results[0].id;

                        db.query("UPDATE employee SET role_id = ? WHERE first_name = ?", newRoleID, employeeFirstName, function (err, result) {
                            if (err) throw err;
                            
                            console.log("Employee role is now updated");
                            mainMenu();
                        })
                    })
                });
            });
        });
    }
};

mainMenu();