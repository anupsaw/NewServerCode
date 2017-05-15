#create apidata folder first if not exists.

# node-server-code
# base URL
http://localhost/api/

Entity Name to Get the data or create the data.

#example -  to save User data do post on 

  post : http://localhost/api/user
  
#It will create the folder named users/user.json file and returned the data with new Id . It keeps all the user entity data in user.json file
  
  to get the complete user data use
  
get : http://localhost/api/user
  
 get : http://localhost/api/user/id -  id will be the generated id from the post 
  
  
  
  
