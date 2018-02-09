# HPCCInfo
A Workbook (like an Excel workbook) to view HPCC data files and apply simple data manipulation

## Requirements

For development, you will only need [Node.js](http://nodejs.org/) and [MYSQL Server](https://dev.mysql.com/downloads/mysql/) installed on your environment.


### Node

[Node](http://nodejs.org/) is really easy to install & now include [NPM](https://npmjs.org/).
You should be able to run the following command after the installation procedure
below.

    $ node --version
    v8.9.4

    $ npm --version
    5.6.0

## Install

	$ git clone https://github.com/hpcc-systems/HPCCInfo.git
	$ cd HPCCInfo/server
	$ npm install -g bower
	$ npm install

Execute myql script located in folder HPCCInfo/server/HPCCInfo_schema.sql
Update the MySql connection properties in HPCCInfo/server/DBConnection.js

	$ cd HPCCInfo/client
	$ bower install

## Start the application

	$ cd HPCCInfo/server
	$ node server.js

Open Google Chrome browser and enter the url (http://localhost:3000)

#### NOTE: 
We recommed using Google Chrome browser. The application is only being tested using Google Chrome. If you are using any other browser, the application might not run properly.

## Bugs and Feedback

For bugs, questions and discussions please use the [Github Issues](https://github.com/hpcc-systems/HPCCInfo/issues).

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D