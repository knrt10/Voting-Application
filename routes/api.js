var express = require("express");
var router = express.Router({ caseSensitive: true });
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jsonwebtoken");
var User = require("../models/user");
var Poll = require("../models/polls");




router.delete('/polls/:id', function(request, response,$routeParams) {
    Poll.findById($routeParams.id, function(err, poll) {
        if (err) {
            return response.status(400).send({
                message: 'No poll with specified id'
            });
        }
        if (poll) {
            console.log("hy here");
            var token = request.headers.authorization.split(' ')[1];
            jwt.verify(token, 'fcc', function(err, decoded) {
                if (err) {
                    return response.status(401).json('Unauthorized request: invalid token');
                } else {
                    console.log(poll);
                    if (decoded.data.name === poll.owner) {
                        poll.remove(function(err) {
                            if (err) {
                                return response.status(400).send(err)
                            } else {
                                return response.status(200).send({
                                    message: 'Deleted poll'
                                })
                            }
                        })
                    } else {
                        return response.status(403).send({
                            message: 'Can only delete own polls'
                        })
                    }
                }
            })
        }
    });
});






router.get('/poll/:id', function(request, response) {
    Poll.findOne({ _id:request.params.id }, function(err, poll) {
        if (err) {
            return response.status(400).send(err)
        } else {
            console.log(request.params.id );
            return response.status(200).send(poll)
        }
    })
})





router.put('/polls/add-option', function(request, response) {
    var id = request.body.id;
    var option = request.body.option;
    Poll.findById(id, function(err, poll) {
        if (err) {
            return response.status(400).send(err)
        }
        for (var i = 0; i < poll.options.length; i++) {
            if (poll.options[i].name === option) {
                return response.status(403).send({
                    message: 'Option already exists!'
                })
            }
        }
        poll.options.push({
            name: option,
            votes: 0
        });
        poll.save(function(err, res) {
            if (err) {
                return response.status(400).send({
                    message: 'Problem has occurred in saving poll!',
                    error: err
                })
            } else {
                return response.status(201).send({
                    message: 'Successfully created a poll option!'
                })
            }
        })
    })
});

router.put('/polls/', function(request, response) {
    console.log(typeof request.body.vote);
    Poll.findById(request.body.id, function(err, poll) {
        if (err) {
            return response.status(400).send(err)
        }
        console.log(poll)
        for (var i = 0; i < poll.options.length; i++) {
            if (poll.options[i]._id.toString() === request.body.vote) {
                console.log('hit');
                poll.options[i].votes += 1;
                poll.save(function(err, res) {
                    if (err) {
                        
                        return response.status(400).send(err)
                    } else {
                        return response.status(200).send({
                            message: 'Successfully updated poll!'
                        })
                    }
                })
            }
        }
    })
});




router.get('/user-polls/:name', function(request, response) {
    if (!request.params.name) {
        return response.status(400).send({
            message: 'No user name supplied'
        });
    } else {
        Poll.find({ owner: request.params.name }, function(err, documents) {
            if (err) {
                return response.status(400).send(err);
            } else {
                return response.status(200).send(documents);
            }
        });
    }
});




// test populate route to get all polls by user id

router.get('/tester',function(req, res) {
    User.findOne({
        name:"kautilya"
    })
    .populate('polls')
    .exec(function(err,polls){
        if(err){
            return res.status(400).send(err);
        }
         return res.status(200).send(polls);
    });
});


// Get all polls 

router.get('/polls', function(request, response) {
    Poll.find({}, function(err, polls) {
        if (err) {
            return response.status(404).send({})
        } else {
            return response.status(200).json(polls)
        }
    })
});

//Create a new Poll

router.post('/polls', function(request, response) {
    var poll = new Poll();
    poll.name = request.body.name;
    poll.options = request.body.options;
    poll.owner = request.body.owner;
    poll.save(function(err, document) {
        if (err) {
            if (err.code === 11000) {
                return response.status(400).send('No dupes!');
            }
            return response.status(400).send(err)
        } else {
            return response.status(201).send({
                message: 'Successfully created a poll',
                data: document
            })
        }
    })
})





//Verifying tokens

router.post('/verify',(req,res)=>{
   if(!req.body.token){
       return res.status(400).send("Invalid Token");
   }
  jwt.verify(req.body.token, process.env.secret, function(err,decoded){
      if(err){
          return res.status(400).send("Token Error");
      }
    return res.status(200).send(decoded);
  })
});


//Login

router.post('/login',(req,res)=>{
    if(req.body.name && req.body.password){
        
            User.findOne({name: req.body.name},function(err,user){
                if(err) {
                                return res.status(400).send('an Error has occured please try again ');
                }
                 if(!user){
                    return res.status(404).send('Please register first');
                }
                 if(bcrypt.compareSync(req.body.password, user.password)){
                     
                     var token = jwt.sign({
                         data:user
                     },process.env.secret,{expiresIn : 3600 })
                     
                    return res.status(200).send(token);
                }
                
                    return res.status(400).send(req.body.name + " " +"Password is not correct");
                
            });
        }
        else{
            return res.status(400).send('Invalid credentials . Please enter valid one ');
        }
    });



//register

router.post('/register',(req,res)=>{
    if(req.body.name && req.body.password){
        var user = new User();
        user.name = req.body.name;
        console.time('bcryptHashing');
        user.password = bcrypt.hashSync( req.body.password , bcrypt.genSaltSync(10));
        console.timeEnd('bcryptHashing');
        user.save(function(err,document){
            if(err){
                return res.status(400).send(err);
            }
            else{
                var token = jwt.sign({
                    data : document
                },process.env.secret , { expiresIn : 3600});
                return res.status(201).send(token);
            }
        });
    }
    else{
        return res.status(400).send({
            message:'Invalid credentials . Please enter valid one '
        });
    }
});


// Authentication function



module.exports= router;