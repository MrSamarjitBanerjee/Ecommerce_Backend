const verifyEmailTemplate = ({name,url})=>{
    return`
<p>Dear ${name}</p>    
<p>Thank you for registering in Ecommerce Backend Service by Samarjit.</p>   
<p>Best Wishes </p>
<a href=${url} style="color:black;background:orange;margin-top:10px;padding:20px;display:block">
    Verify Email
</a>
`
}

module.exports = verifyEmailTemplate