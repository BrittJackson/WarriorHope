/**
 * This module is used to make requests to the NodeBB API.
 */

/** @module nodebbAPI*/


const fetch = require('node-fetch');
const BASE_URL = `http://411crystal.cpi.cs.odu.edu:4567/api`

// This token is generated here 'http://411crystal.cpi.cs.odu.edu:4567/admin/plugins/write-api'
const token = 'fe4c55d1-2233-4014-a1ee-2de9ad094f7f';
const bearer = 'Bearer ' + token;

// Privileges to add/remove
const privileges = [
	'groups:find',
	'groups:read',
	'groups:topics:read',
   'groups:topics:create',
   'groups:topics:delete',
	'groups:topics:reply',
	'groups:topics:schedule',
	'groups:topics:tag',
	'groups:posts:edit',
	'groups:posts:history',
	'groups:posts:delete',
	'groups:posts:upvote',
   'groups:posts:downvote',
];

/**
 * Categories have these groups added by default.  
 * They must be removed during splitGC
 */
const groupsToRemove = [
   'registered-users',
   'guests',
   'spiders',
];

module.exports = {
   setup,
   teardown,

   joinGC,
   splitGC,

   makeCategory,
   allCategories,
   findCategory,
   removeCategory,
   deleteCategory,
   createCategory,
   updateCategory,

   makeGroup,
   allGroups,
   findGroup,
   removeGroup,
   createGroup
}

/**
 * Encapsulates the creation and joining function calls of group and category.  
 * @param {string} id
 * @returns the status code of the request
 */
async function setup(id){
      await makeGroup(id);
      const response = await makeCategory(id);
      if(response != 400) {
         console.log('Update Category')
         const result = await updateCategory(id);
         return result;
      }
      else if(response == 400){
         return 400;
      }
}

/**
 * Used in testing to remove all groups and categories created
 * @param {string} gid
 * @param {string} catid
 */
async function teardown(gid,catid){
   await removeGroup(gid);
   await makeCategory(catid);
}

/**
 * Category Functions
 */

 /**
 * Encapsulates the joining of a group and category
 * @param {string} id
 * @returns the status code of the request
 */
async function updateCategory(id) {
   var response = 400;
   const result = await allCategories();
   const found = await findCategory(result,id);
   if(found){
      res = await joinGC(id,found);
      await splitGC(found)
      console.log(res);
      response = res.status;
   }
   return response;
}


/**
 * API call to join the group and category
 * @param {string} id
 * @param {string} cid
 * @returns an object containing the status code of the call and the body
 */
function joinGC(id,cid) {
   return fetch(BASE_URL + `/v2/categories/${cid}/privileges`, {
      method:"PUT",
      headers: {
         'Authorization': bearer,
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         "privileges": privileges,
         "groups": id
      }) 
   })
   .then(res => res.json().then(data => ({status:res.status, body:data})))
   .catch(error => error.message);
}

/**
 * API call to ONLY allow a group to view a category (bar mods/admin)
 * @param {string} cid
 * @returns an object containing the status code of the call and the body
 */
function splitGC(cid) {
   return fetch(BASE_URL + `/v2/categories/${cid}/privileges`, {
      method:"DELETE",
      headers: {
         'Authorization': bearer,
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         "privileges": privileges,
         "groups": groupsToRemove
      }) 
   })
   .then(res => res.json().then(data => ({status:res.status, body:data})))
   .catch(error => error.message);
}

/**
 * Encapsulates the creation of a category
 * @param {string} id
 * @returns the status code of the request
 */
async function makeCategory(id) {
   var response = 400;
   const result = await allCategories();
   const found = await findCategory(result,id);
   if(!found){
      res = await createCategory(id);
      console.log(res);
      response = res.status;
   }
   return response;
}

/**
 * API call to retrieve all categories
 * @returns an JSON Obj containing the response
 */
function allCategories() {
   return fetch(BASE_URL + "/categories", {
      method:"GET",
      headers: {
        'Authorization': bearer,
      }
  })
  .then(res => res.json())
  .catch(error => error.message);
}


/**
 * Searches a JSON Obj to find a category by name
 * @param {JSON} result
 * @param {string} id
 * @param {*} resolve
 * @returns the cid of the category if it was found or false
 */
function findCategory(result,id) {
   return new Promise(async(resolve) => {
      for (const categories of result.categories) {
         console.log(categories.name);
         if (categories.name == id) {
            console.log('Found Category on NodeBB');
            resolve(categories.cid)
            break;
         }
      }
      resolve(false)
   })
}

/**
 * API call to create a category
 * @param {string} id
 * @returns an object containing the status code of the call and the body
 */
function createCategory(id) {
   console.log('Did not find Category');
   return fetch(BASE_URL + "/v2/categories", {
      method:"POST",
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         "name": id
     }) 
  })
  .then(res => res.json().then(data => ({status:res.status, body:data})))
  .catch(error => error.message);
}

/**
 * Encapsulate the removal of a category
 * @param {string} id
 * @returns the status code
 */
async function removeCategory(id) {
   const result = await allCategories();
   const found = await findCategory(result,id);
   if(found){
      const response = await deleteCategory(found);
      console.log(response);
      return response;
   }
   else {
      return 404;
   }
}

/**
 * API call to delete a category
 * @param {string} id
 * @returns the status code
 */
function deleteCategory(id) {
   return fetch(BASE_URL + `/v2/categories/${id}`, {
      method:"DELETE",
      headers: {
        'Authorization': bearer,
      }
  })
  .then(res => res.status)
  .catch(error => error.message);
}

/**
 * Group Functions
 */

 /**
 * Encapsulates the creation of a group
 * @param {string} id
 * @returns the status code of the request
 */
async function makeGroup(id) {
   var response = 400;
   const result = await allGroups();
   const found = await findGroup(result,id)
   if(!found) {
      response = await createGroup(id)
   }
   return response;
}

/**
 * API call to retrieve all groups
 * @returns an JSON Obj containing the response
 */
function allGroups() {
   return fetch(BASE_URL + "/groups", {
      method:"GET",
      headers: {
        'Authorization': bearer,
      }
  })
  .then(res => res.json())
  .catch(error => error.message);
}

/**
 * Searches a JSON Obj to find a group by name
 * @param {JSON} result
 * @param {string} id
 * @param {*} resolve
 * @returns if the group was found
 */
function findGroup(result,id) {
   return new Promise(async(resolve) => {
      for (const groups of result.groups) {
         // console.log(groups.name);
         if (groups.name == id) {
            // console.log('Found Group on NodeBB');
            resolve(true)
            break;
         }
      }
      resolve(false)
   })
}

/**
 * API call to create a group
 * @param {string} id
 * @returns the status code
 */
function createGroup(id) {
   return fetch(BASE_URL + "/v2/groups", {
      method:"POST",
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         "name": id,
         "hidden": false,
         "private": false,
         "ownderUid": "1"
     }) 
  })
  .then(res => res.status)
  .catch(error => error.message);
}

/**
 * API call to delete a group
 * @param {string} id
 * @returns the status code
 */
async function removeGroup(id) {
   var gid = id.toLowerCase();
   console.log(gid);
   return fetch(BASE_URL + `/v2/groups/${gid}`, {
      method:"DELETE",
      headers: {
        'Authorization': bearer,
      }
  })
  .then(res => res.status)
  .catch(error => error.message);
}