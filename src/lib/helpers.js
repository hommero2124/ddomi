const bcrypt = require('bcryptjs');
const sha1 = require('sha1');

const helpers={}

helpers.encritarPassword=async(password)=>{
    const sait = await bcrypt.genSalt(1);
    const clave = await bcrypt.hash(password,sait);

    const sait2 = await bcrypt.genSalt(1);
    const clave2 = await bcrypt.hash(clave,sait2);
    return clave2;
}

helpers.compararPassword = async(password, passwordGuardada)=>{
    return await bcrypt.compare(password, passwordGuardada);
}

helpers.crearSha1=async(password)=>{
    return sha1(password);
}

module.exports = helpers;