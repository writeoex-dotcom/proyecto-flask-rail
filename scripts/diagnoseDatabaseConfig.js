const { databaseConfig } = require('../src/config/database');

console.log(JSON.stringify({
  databaseReadyCheck: 'Este comando solo revisa variables; no abre conexión MySQL.',
  recommendedRailwayUrl: 'MYSQL_URL=${{MySQL.MYSQL_URL}}',
  recommendedRailwaySeparateVars: {
    MYSQLHOST: 'mysql.railway.internal',
    MYSQLPORT: '3306',
    MYSQLDATABASE: 'railway',
    MYSQLUSER: 'root',
    MYSQLPASSWORD: '${{MySQL.MYSQLPASSWORD}}',
  },
  detected: databaseConfig.summary,
}, null, 2));

if (databaseConfig.summary.configurationWarnings.length) {
  process.exitCode = 1;
}
