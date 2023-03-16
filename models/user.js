var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

const sequelize = new Sequelize('pharmacy', 'root', '', {
    host:'localhost',
    port:'3306',
    dialect: 'mysql',
    pool: {
        max:5,
        min:0,
        aquire:30000,
        idle:10000,
    },
    operatorsAliases: false
});


//set up user table
var User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

//encrypt password
User.beforeCreate((user, option) => {
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(user.password, salt);
});

User.prototype.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

//create all defined tables in the specified database
sequelize.sync()
   .then(() => console.log('user table has been successfully created'))
   .catch(error => console.log('this error occured', error));

//export User module for other files
module.exports = User;