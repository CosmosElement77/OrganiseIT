// let em=document.getElementById("email").value;
// let OTP=(Math.floor(Math.random() * 100000));

const nm=require("nodemailer");
const transporter = nm.createTransport({
    host:"smtp.gmail.com",
    secure:true,
    // service: 'Gmail',
    auth: {
      user: 'organise8t@gmail.com', 
      pass: process.env.mail_auth,
    }
  });

async function Sender(email, OTP){
    try{

        const info = await transporter.sendMail({
            from: '"Team OrganiseIT" <organise8t@gmail.com>',
            to: email,
            subject: 'Email-ID verification',
            text: 'Kindle verify check the below OTP on the website .',
            html: '<h2>The OTP is given below</h2><br><strong>'+OTP+'</strong><p><b>Kindly do not share the above OTP with anyone else !</b><br>(〜￣▽￣)〜</p>',
          });
        console.log(info);
    }
    catch(error){
        console.log(error);
    }
}

// Sender();
module.exports={Sender};










