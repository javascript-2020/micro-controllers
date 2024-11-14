/*


npm i node-forge


*/


var nodeForge   = require('node-forge');



var pki         = nodeForge.pki;

var today       = new Date();
var one_year    = new Date();
one_year.setFullYear(one_year.getFullYear()+1);

var config      = {};

config.from     = today;
config.to       = one_year;

config.dns      = ['localhost'];
config.ip       = ['127.0.0.1','127.0.0.2'];

config.rdn      = {};

config.rdn.cn   = 'test certificate';
config.rdn.o    = '';
config.rdn.ou   = '';
config.rdn.l    = '';
config.rdn.st   = '';
config.rdn.c    = '';


            config.dns    = [];
            config.ip     = [];
            
            
            if(config.dns.length==0 && config.ip.length==0){
                  config.dns    = ['localhost'];
                  config.ip     = ['127.0.0.1','127.0.0.2'];
            }
            
            config.from     = new Date(config.from);
            config.to       = new Date(config.to);
            
            var {key,cert}  = generate();
            
            console.log(key);
            console.log(cert);
            
            
function generate(){

    var keys                  = pki.rsa.generateKeyPair(2048);
    var cert                  = pki.createCertificate();
    
    cert.publicKey            = keys.publicKey;
    
    cert.serialNumber         = '01';
    cert.validity.notBefore   = config.from;
    cert.validity.notAfter    = config.to;
    
    var attrs   = [];
    for(var name in config.rdn){
        attrs.push({shortName:name.toUpperCase(),value:config.rdn[name]});
    }//for
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    var altNames    = [config.dns.map(dns=>{return {type:2,value:dns}}),config.ip.map(ip=>{return {type:7,ip}})].flat();
    
    cert.setExtensions([
          {
                name                : 'basicConstraints',
                cA                  : true,
                pathLenConstraint   : 0
          },
          {
                name                : 'keyUsage',
                keyCertSign         : true,
                digitalSignature    : true,
                nonRepudiation      : true,
                keyEncipherment     : true,
                dataEncipherment    : true
          },
          {
                name                : 'extKeyUsage',
                serverAuth          : true,
                clientAuth          : true,
                codeSigning         : true,
                emailProtection     : true,
                timeStamping        : true
          },
          {
                name                : 'nsCertType',
                client              : true,
                server              : true,
                email               : true,
                objsign             : true,
                sslCA               : true,
                emailCA             : true,
                objCA               : true
          },
          {
                name                : 'subjectAltName',
                altNames            : altNames
          },
          {
                name                : 'subjectKeyIdentifier'
          }
    ]);
    
    cert.sign(keys.privateKey);
    
    var key     = pki.privateKeyToPem(keys.privateKey);
    var cert    = pki.certificateToPem(cert);
    
    return {key,cert};
    
}//generate
