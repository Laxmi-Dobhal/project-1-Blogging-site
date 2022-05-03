const blogModel = require("../Model/blogModel");
const authorModel = require("../Model/authorModel");
const jwt = require("jsonwebtoken")
let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

const createAuthor = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status:false, msg: "data must be given" })

        if (!data.fname) return res.status(400).send({ status: false, msg: "First Name is Requried" })
        if (!data.lname) return res.status(400).send({ status: false, msg: "Last Name is Requried" })   
        if (!data.title) return res.status(400).send({ status: false, msg: "title is Requried" })
        if (!data.password) return res.status(400).send({ status: false, msg: "password is Requried" })
        if (!data.email) return res.status(400).send({ status: false, msg: "email  is Requried" })
        let validTitle = ['Mr', 'Mrs', 'Miss']
        if (!validTitle.includes(data.title)) return res.status(400).send({ status: false, Error: "Title should be one of this (Mr, Mrs, Miss)" })

        let checkmail = regex.test(data.email.toLowerCase())
        if (checkmail == false) return res.status(400).send({status:false,msg:"email not valid"})

        let emailidexist = await authorModel.findOne({ email: data.email })
        if (emailidexist) {
            return res.status(400).send({ status:false , msg: "email alredy exist" })
        }

        let author_data = await authorModel.create(data)
        return res.send({ status:true,msg:"author created successfully", data: author_data })
    }
    catch (e) {
        res.status(500).send({status:false , msg:e.message})
    }
}

const createBlog = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length === 0) res.status(400).send({ status:false, msg: "data must be given" })

        if (!data.title) return res.status(400).send({ status: false, msg: "title is Requried" })
        if (!data.body) return res.status(400).send({ status: false, msg: "body is Requried" }) 
        if (!data.tags) return res.status(400).send({ status: false, msg: "tags is Requried" })   
        if (!data.category) return res.status(400).send({ status: false, msg: "category feild is Requried" }) 
        if (!data.authorId) return res.send({ status: false, msg: 'Author Id missing' })
        
        if(data.hasOwnProperty('ispublished')) {
            if (data.ispublished == true) {
                data.publishedAt = Date.now()
            }
        }
        
        let authorId = data.authorId
        let checkAuthorId = await authorModel.findOne({ _id: authorId })
        if (!checkAuthorId) {
            return res.status(400).send({ status:false, msg: "enter valid author id" })
        }

        let createBlogData = await blogModel.create(data)
        return res.status(201).send({ status: true,msg:"blog created successfully", data: createBlogData })
    } catch (e) {
        res.status(500).send({status:false , msg:e.message})
    }
}

const getBlog = async function (req, res) {
    try {
        let filter = req.query
        filter.isdeleted = false
        filter.ispublished = true

        if(filter.hasOwnProperty('authorId'))
        {
            let checkAuthorId = await authorModel.findOne({ _id: filter.authorId })
            if (!checkAuthorId) {
                return res.status(400).send({ status:false, msg: "enter valid author id" })
            }
        }

        let blog = await blogModel.find(filter).populate("authorId")
        if (blog.length == 0) return res.status(404).send({ status:false , msg: "no data found" })
        res.status(200).send({status:true, data: blog })
    } catch (e) {
        res.status(500).send({status:false , msg:e.message})
    }
}

const putBlog = async function (req, res) {
    try {
        let blogid = req.params.blogid
        let checkId = await blogModel.findOne({ _id: blogid, isdeleted: false })
        if (!checkId) return res.status(404).send({ status :false , msg: "blog id not exist in record" })

        let data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({status:false , msg: "data for updation must be given" })
        
        if (data.hasOwnProperty('ispublished')) {
            if (data.ispublished == true) {
                data.publishedAt = Date.now()
            }
        }

       if(data.hasOwnProperty('isdeleted'))
       {
           if(data.isdeleted == true)
           {
            return res.status(400).send({status:false , msg: "we can not set delete true from here" })
           }
       }

       if(data.hasOwnProperty('authorId'))
       {
         return res.status(400).send({status:false , msg: "author id is not to be update"})
       }

       if(data.hasOwnProperty('tags'))
       {
            let tag = checkId.tags
            let newTag = data.tags
            tag.push(newTag)
            data.tags = tag
       }
       if(data.hasOwnProperty('subcategory'))
       {
            let sc = checkId.subcategory
            let newSc = data.subcategory
            sc.push(newSc)
            data.subcategory = sc
       }

        let blog = await blogModel.findOneAndUpdate(
            { _id: blogid },
            { $set: data },
            { new: true }
        )
       return res.status(200).send({ status:true,msg:"data successfully updated", data: blog })
    }
    catch (e) {
        res.status(500).send({status:false , msg:e.message})
    }
}

const checkDeleteStatus = async function (req, res) {
    try {
        let blogid = req.params.blogid
        let deleted = await blogModel.findOneAndUpdate(
            { _id: blogid , isdeleted:false},
            { $set: { isdeleted: true, deletedAt: Date.now() } }
        )
        if (!deleted) return res.status(400).send({ status :false , msg: "blog id not valid for deletation" })
        res.status(200).end()
    } catch (e) { 
        res.status(500).send({status:false , msg:e.message})
     }
}

const DeleteStatus = async function (req, res) {
    try {
        let token = req['x-api-key'];
        if(!token) return res.status(400).send({ status :false , msg: "token is not available" })
        var decoded = jwt.decode(token)
        let authorid = decoded.authorId
        let data = req.query
        data.authorId = authorid

        let deleted = await blogModel.updateMany(
            data,
            { $set: { isdeleted: true, deletedAt: Date.now() } },
            { new: true }
        )
        if (!deleted) return res.status(404).send({ status :false , msg: "blog id not exist in record" })
        res.status(200).send({ status:true , data: deleted })

    } catch (e) { res.status(500).send(e.message) }
}

const logIn = async function (req, res) {
    try{
    let data = req.body
    if (Object.keys(data).length === 0) return res.status(400).send({ status:false ,  msg: "data must be given" })
    let email = req.body.email
    let password = req.body.password
    if(!email || !password)
    return res.status(400).send({ status:false ,  msg:"Email and password both must be present"})

    let author = await authorModel.findOne({email:email ,password:password})
    if(!author) return res.status(400).send({  status:false , msg : "Email or Password not matched "})

    let token = jwt.sign({authorId : author._id.toString()},'project-1')
    res.status(201).send({status:true , data:token})
}
catch(err){
res.status(500).send({status:false , msg:e.message})
}
}

module.exports.createAuthor = createAuthor
module.exports.createBlog = createBlog
module.exports.getBlog = getBlog
module.exports.putBlog = putBlog
module.exports.checkDeleteStatus = checkDeleteStatus
module.exports.DeleteStatus = DeleteStatus
module.exports.logIn = logIn
