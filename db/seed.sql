-- Using the company_db database
USE employeeDB;

-- Inserting department values
INSERT INTO department (name)
VALUES ("Front Desk");
INSERT INTO department (name)
VALUES ("Cleaning");
INSERT INTO department (name)
VALUES ("Repair");
INSERT INTO department (name)
VALUES ("Accounting");

-- Inserting role values
INSERT INTO role (title, salary, department_id)
VALUES ("Receptionist", 40000, 1);
INSERT INTO role (title, salary, department_id)
VALUES ("Housekeeper", 50000, 2);
INSERT INTO role (title, salary, department_id)
VALUES ("Maintenance", 60000, 3);
INSERT INTO role (title, salary, department_id)
VALUES ("Book Keeper", 55000, 4);

-- Inserting employee values for Receptionists
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Alex", "Smith", 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Gabby", "Doe", 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Muir", 1, 2);

-- Inserting employee values for Housekeepers
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Kate", "Jones", 2, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Zoki", "Bane", 2, 3);

-- Inserting employee values for Maintenance
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Dave", "Barnes", 3, 4);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Nick", "Seed", 3, null);

-- Inserting employee values for Book Keepers
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Manuela", "Read", 4, 5);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Geralt", 4, null);
