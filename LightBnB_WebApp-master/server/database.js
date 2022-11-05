const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
    .query(`
    SELECT * FROM users
    WHERE email = $1;
    `, [email])
    .then(res => {
      if (res.rows.length) {
        return res.rows[0];
      } else {
        return null;
      }
    })
    ;
}

  // for (const userId in users) {
  //   user = users[userId];
  //   if (user.email.toLowerCase() === email.toLowerCase()) {
  //     break;
  //   } else {
  //     user = null;
  //   }
  // }
  // return Promise.resolve(user);
//}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {
  return pool.query(`
    select * from users where id = $1
      `,[id])
    .then(res => {
      if (res.rows.length) {
        return res.rows[0];
      } else {
        return null;
      }
    })
    .catch((err)=>{
      console.log(err.message);
      //return(null);
    });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(obj) {
  // const query={
  //   'insert into users (name,email,password) values($1,$2,$3)',
  //   values: [name,email,password]
  // }; 
  return pool.query(`insert into users (name,email,password) values($1,$2,$3) returning *`,[obj.name,obj.email,obj.password])
  .then(result=>{console.log(result.rows)
  })
  .catch(error=> console.error(error.stack));
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id) {
  return pool.query(`
  select properties.*,avg(property_reviews.rating) as average_rating from properties join property_reviews on property_reviews.property_id = properties.id
  join reservations on reservations.property_id = properties.id
  group by properties.id,reservations.guest_id having reservations.guest_id = $1
  order by properties.title
   `,[guest_id])
.then((result)=>{
  if (result.rows.length) {
    return result.rows;
  } else {
    return null;
  }
  // setTimeout(()=>{
  //   console.log(result.rows);
  // })
})
.catch((err)=>{
  console.log(err.message);
})


  return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = function(options,limit=10) {
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    //numWhere = (queryParams.length>1) ? ' AND ' : 'WHERE';
    queryString += `${(queryParams.length>1) ? ' AND ' : 'WHERE'} city LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night){
    queryParams.push(`${options.minimum_price_per_night}`);
    //numWhere = (queryParams.length>1) ? ' AND ' : 'WHERE';
    queryString += `${(queryParams.length>1) ? ' AND ' : 'WHERE'}  cost_per_night >= $${queryParams.length}`;
  }

  if (options.maximum_price_per_night){
    queryParams.push(`${options.maximum_price_per_night}`);
    //numWhere = (queryParams.length>1) ? ' AND ' : 'WHERE';
    queryString += `${(queryParams.length>1) ? ' AND ' : 'WHERE'}  cost_per_night <= $${queryParams.length}`;
  }

  

  if (options.owner_id){
    queryParams.push(`${options.owner_id}`);
    //numWhere = (queryParams.length>1) ? ' AND ' : 'WHERE';
    queryString += `${(queryParams.length>1) ? ' AND ' : 'WHERE'}  properties.owner_id = $${queryParams.length}`;
  }
    
  // 3.1
    queryString += `
  GROUP BY properties.id`;
  if (options.minimum_rating){
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }
  
  //4
  queryParams.push(limit);
  queryString += ` ORDER BY cost_per_night  
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool
  .query(queryString, queryParams)
  .then((res) => res.rows)
  .catch((err)=> console.log(err.message));
};
 

//getAllProperties();
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
