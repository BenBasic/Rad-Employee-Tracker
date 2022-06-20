// Requirement which allows inquirer package to be used with node.js
const inquirer = require("inquirer");
// Requirement allows running databases within server
const mysql = require('mysql2');
// Setting up the requirements
const express = require('express');
// Setting up the port, will run in process environment port, if local it will be 30001
const PORT = process.env.PORT || 3001;
// Setting up express
const app = express();
