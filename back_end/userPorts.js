/**
 * Used to deconflict development on the VM.  Running something like `npm start` to test development
 * will start a webserver, and this may interfere with the actual website or other users.  
 * This module uses the environmental variable found on the VM to assign each person a port number
 * that they can run on the VM.
 * @module userPorts
 */

/**
 * This module determines a port number for a specific member of the team so that 
 * they can use the VM to develop and not affect each other or the main project
 * @returns {integer} port number for specific user if using the VM
 */
function getPortNumber () {
    switch(process.env.USER) {
      case 'bjackson':
        return 2999;
      case 'epanagio':
        return 2998;
      case 'gfelicia':
        return 2997;
      case 'jlapira':
        return 2996;
      case 'jphillmo':
        return 2995;
      case 'klittlef':
        return 2994;
      case 'targenbr':
        return 2993;
      case 'tree':
        return 2992;
      default:
        return 3000;
    }
  }

module.exports = getPortNumber;