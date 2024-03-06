const express = require("express");
const app = express();
const mysql2 = require("mysql2")
const fileuploader = require("express-fileupload");
const obj = {
    host: "127.0.0.1",
    user: "root",
    password: "Ayush@2481",
    database: "project",
    dateStrings: true // challange of time showing in IST
}
app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());

const mysql = mysql2.createConnection(obj);

mysql.connect(function (err) {
    if (err == null)
        console.log("Connected to database");
    else
        console.log(err.message);
})

app.listen(3004, function () {
    console.log("Welcome to server 3004");

})

app.use(express.static("public"));

app.get("/", function (req, resp) {
    let filePath = process.cwd() + "/index.html";
    resp.sendFile(filePath);
});

app.get("/saveProfile", function (req, resp) {
    const email = req.query.txtEmail;
    const password = req.query.txtPwd;
    const usertype = req.query.utype;
    const status = 1;

    mysql.query("Insert into users values(?,?,?,current_date(),?)", [email, password, usertype, status], function (err) {
        if (err == null) {
            resp.send("Sign Up Successfully!!!");
        }
        else {
            resp.send(err.message)
        }
    })
})
//------------------------------------------------
app.get("/check-User", function (req, resp) {
    mysql.query("select * from users where emailid=?", [req.query.kuchEmail], function (err, resultJsonArray) {
        if (resultJsonArray.length == 1)
            resp.send("Email already exists");
        else
            resp.send("Yess!!! Available");
    })
})


//-------------------------------------------------
app.get("/checkUserLogin", function (req, resp) {
    mysql.query("select * from users where emailid=?", [req.query.kuchEmail], function (err, resultJsonArray) {
        if (resultJsonArray.length == 1)
            resp.send("Email exists");
        else
            resp.send("Please signup first!!!");
    })
})
    ;
//---------------------------------------------
app.get("/change-pass", function (req, resp) {
    const email = req.query.email;
    const oldpass = req.query.oldpass;
    const newpass = req.query.newpass;

    mysql.query("update users set pwd=? where emailid=? and pwd=?", [newpass, email, oldpass], function (err) {
        if (err == null) {
            resp.send("PASSWORD CHANGED SUCCESSFULLY");
        }
        else {
            resp.send(err.message);
        }
    })
})
//------------------------------------------------
app.get("/profileLogin", function (req, resp) {
    const emaill = req.query.Emailiid;
    const passwor = req.query.Passwords;
    mysql.query("select * from users where emailid=? and pwd=?", [emaill, passwor], function (err, resultJsonArray) {
        if (err) {
            
            resp.send(err.message);
            return;
        }
        if (resultJsonArray.length == 1) {
            if (resultJsonArray[0].status == 1) {
                const utype = resultJsonArray[0].usertype;
                resp.send(utype);
            }
            else
                resp.send("YOUR ACCOUNT IS BLOCKED PLZ CONTACT THE SERVER ADMIN!!");
        }
        else {
            resp.send("INVALID ID OR PASSWORD!!!");
        }
    });
});
//-------------------------------------
app.get("/inputProf", function (req, resp) {
    let filePath = process.cwd() + "/profile-customer.html";
    resp.sendFile(filePath);
})
app.get("/login-signup", function (req, resp) {
    let filePath = process.cwd() + "/login-signup.html";
    resp.sendFile(filePath);
})


app.post("/custProfileSave", function (req, resp) {
    const Email = req.body.txtEmailProf;
    const Fname = req.body.txtNameProf;
    const Lname = req.body.txtLnameProf;
    const address = req.body.txtAddProf;
    const num = req.body.txtNumProf;
    const userState = req.body.txtStateProf;
    const city = req.body.txtCityProf;

    let filename;

    filename = req.files.photo.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.photo.mv(path);//to store pic in uploads folder 

    req.body.photo = filename;
    console.log(req.body.txtEmailProf);

    mysql.query("insert into customprof values(?,?,?,?,?,?,?,?)", [Email, Fname, Lname, num, address, city, userState, filename], function (err) {
        if (err == null)
            resp.send("Record Saved Successfullyyy");
        else
            resp.send(err.message);
    })

})
//------------------------------------------------------
app.post("/custProfileUpdate", function (req, resp) {
    const Email = req.body.txtEmailProf;
    const Fname = req.body.txtNameProf;
    const Lname = req.body.txtLnameProf;
    const address = req.body.txtAddProf;
    const num = req.body.txtNumProf;
    const userState = req.body.txtStateProf;
    const city = req.body.txtCityProf;

    let filename;
    if (req.files == null) {
        filename = req.body.hdn;
    }
    filename = req.files.photo.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.photo.mv(path);//to store pic in uploads folder 

    req.body.photo = filename;
    // resp.send(filename);
    console.log(filename);

    mysql.query("update customprof set Fname=?,Lname=?,contact=?,address=?,city=?,state=?,picname=? where emailid=?", [Fname, Lname, num, address, city, userState, filename, Email], function (err) {
        if (err == null) {
            resp.send("Record Modified Successfullyyy");
        }
        else
            resp.send(err.message);
    })

})
//---------------------------------
app.get("/fetch-one", function (req, resp) {
    mysql.query("select * from customprof where emailid=?", [req.query.kuchEmail], function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
//-----------------------------------------------
app.get("/customerDash", function (req, resp) {
    let filePath2 = process.cwd() + "/customer-dashboard.html";
    resp.sendFile(filePath2);
})
app.get("/customerprof", function (req, resp) {
    let filePath2 = process.cwd() + "/profile-customer.html";
    resp.sendFile(filePath2);
})

app.get("/customer-dash-save", function (req, resp) {
    const rid = 0;
    const Email = req.query.txtEmail;
    const task = req.query.txtTask;
    const Address = req.query.txtAdd;
    const City = req.query.txtCity;
    const Date = req.query.txtDate;
    const tasks = req.query.txttasks;


    //console.log(req.query.txtEmailDash);

    mysql.query("insert into task values(?,?,?,?,?,?,?)", [rid, Email, task, Address, City, Date, tasks], function (err) {
        if (err == null)
            resp.send("Record Saved Successfully");
        else
            resp.send(err.message);

    })

})
//----------------------------
app.get("/radioadd", function (req, resp) {
    const email = req.query.emailid;

    mysql.query("select * from customprof where emailid=?", [email], function (err, arry) {

        if (err) {
            resp.send(err.message);
        }
        else {
            resp.send(arry);
        }
    })
})
//------------------------------
app.get("/providerdash", function (req, resp) {
    let filePath3 = process.cwd() + "/service-providerdashboard.html";
    resp.sendFile(filePath3);
})

app.get("/providerprof", function (req, resp) {
    let filePath3 = process.cwd() + "/provider-profile.html";
    resp.sendFile(filePath3);
})

app.post("/provider-profile-save", function (req, resp) {
    const emailadd = req.body.txtEmailProvider;
    const name = req.body.txtnamePro;
    const contact = req.body.txtnumberPro;
    const gender = req.body.txtgenderPro;
    const category = req.body.txtcategoryPro;
    const firm = req.body.txtfirmPro;
    const website = req.body.txtwebsitePro;
    const location = req.body.txtfirmaddPro;
    const since = req.body.txtworkPro;
    const otherinfo = req.body.txtselectPro;

    let filename;

    filename = req.files.txtpicPro.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.txtpicPro.mv(path);//to store pic in uploads folder 

    req.body.txtpicPro = filename;

    //console.log(req.query.txtEmailDash);

    mysql.query("insert into provider values(?,?,?,?,?,?,?,?,?,?,?)", [emailadd, name, contact, gender, category, firm, website, location, since, filename, otherinfo], function (err) {
        if (err == null)
            resp.send("Uploaded Successfully");
        else
            resp.send(err.message);

    })

})
//---------------------------------------
app.post("/Edit-Profile", function (req, resp) {
    // console.log(req.body.txtnamePro);
    const EMAIL = req.body.txtEmailProvider;
    const name = req.body.txtnamePro;
    const Contact = req.body.txtnumberPro;
    const Gender = req.body.txtgenderPro;
    const Category = req.body.txtcategoryPro;
    const Firm = req.body.txtfirmPro;
    const Website = req.body.txtwebsitePro;
    const Location = req.body.txtfirmaddPro;
    const Since = req.body.txtworkPro;
    const Otherinfo = req.body.txtselectPro;

    let filename;

    filename = req.files.txtpicPro.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.txtpicPro.mv(path);//to store pic in uploads folder 

    req.body.txtpicPro = filename;

    mysql.query("update provider set Fname=?,contact=?,gender=?,category=?,firm=?,website=?,location=?,since=?,profpic=?,otherinfo=? where email=?", [name, Contact, Gender, Category, Firm, Website, Location, Since, filename, Otherinfo, EMAIL], function (err) {
        if (err == null) {
            resp.send("Record edited Successfullyyy");
        }
        else
            resp.send(err.message);
    })

})
//------------------------------
app.get("/fetch-providerprofile", function (req, resp) {
    mysql.query("select * from provider where email=?", [req.query.KuchEmail], function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})

//-------------------------
app.get("/angular-fetch-all", function (req, resp) {
    mysql.query("select * from users ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/admin", function (req, resp) {
    let filePath3 = process.cwd() + "/admin.html";
    resp.sendFile(filePath3);
})
app.get("/users-manager", function (req, resp) {
    let filePath3 = process.cwd() + "/users-manager.html";
    resp.sendFile(filePath3);
})
app.get("/angular-delete", function (req, resp) {
    const email = req.query.emailkuch;
    mysql.query("delete from users where emailid=?", [email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1) {
                resp.send("Record Deleted Successfullyyy");
            }
            else
                resp.send("Inavlid ID");
        }
        else
            resp.send(err.message);
    })

})
//----------------
app.get("/block", function (req, resp) {
    const email = req.query.email;
    const status = 0;
    // console.log(req.query.email);

    mysql.query("select * from users where emailid=?",[email],function (err, result) {
            if (err) 
            {
                resp.send(err.message);
                return;
            } 
            else {
                const currentStatus = result[0].status;

                if (currentStatus === 0) {
                    resp.send("ALREADY BLOCKED");
                    
                    return;
                } 
                else {
                    mysql.query("update users set status=? where emailid=? ",[status, email], function (errr) {
                            if 
                            (errr) resp.send(errr.message);
                            else 
                            resp.send("User status blocked successfully.");
                        }
                    );
                }
            }
        }
    );
});
app.get("/resume", function (req, resp) {
    const email= req.query.Email;
    const status = 1;
    // console.log(req.query.email);

    mysql.query("select * from users where emailid=?",[email],function (err, result) {
            if (err) 
            {
                resp.send(err.message);
                return;
            } 
            else {
                const currentStatus = result[0].status;

                if (currentStatus === 1) {
                    resp.send("ALREADY Resumed");
                    
                    return;
                } 
                else {
                    mysql.query("update users set status=? where emailid=? ",[status, email], function (errr) {
                            if 
                            (errr) resp.send(errr.message);
                            else 
                            resp.send("User status resumed successfully.");
                        }
                    );
                }
            }
        }
    );
});
app.get("/angular-fetchprovider-all", function (req, resp) {
    mysql.query("select * from provider ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/provider-table", function (req, resp) {
    let filePath3 = process.cwd() + "/all-providers.html";
    resp.sendFile(filePath3);
})
//-------------
app.get("/angular-fetchcustomer-all", function (req, resp) {
    mysql.query("select * from customprof ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/angular-fetch-distinctcustomer-cities", function (req, resp) {
    mysql.query("select distinct city from customprof ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/angular-fetchcustomercity", function (req, resp) {
    mysql.query("select * from customprof where city=?",[req.query.city],function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
// app.get("/angular-fetch-distinctcustomer-states", function (req, resp) {
//     mysql.query("select distinct state from customprof ", function (err, resultJsonArray) {
//         resp.send(resultJsonArray);
//     })
// })
app.get("/angular-fetchcustomerstates", function (req, resp) {
    mysql.query("select * from customprof where city=?",[req.query.city],function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/customer-table", function (req, resp) {
    let filePath3 = process.cwd() + "/all-customers.html";
    resp.sendFile(filePath3);
})
app.get("/angular-fetchproviderdash-all", function (req, resp) {
    mysql.query("select * from provider ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/providerdash-table", function (req, resp) {
    let filePath3 = process.cwd() + "/all-providersdash.html";
    resp.sendFile(filePath3);
})
app.get("/angular-fetchjobmanager", function (req, resp) {
    mysql.query("select * from task ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/jobmanagerdash-table", function (req, resp) {
    let filePath3 = process.cwd() + "/jobmanagerdash.html";
    resp.sendFile(filePath3);
})
app.get("/angular-fetch-distinct-cities", function (req, resp) {
    mysql.query("select distinct city from task ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/angular-fetchcity", function (req, resp) {
    mysql.query("select * from task where city=?",[req.query.city],function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
// app.get("/angular-fetch-distinctprovider-category", function (req, resp) {
//     mysql.query("select distinct category from provider ", function (err, resultJsonArray) {
//         resp.send(resultJsonArray);
//     })
// })
app.get("/doShowprovidercategory", function (req, resp) {
    mysql.query("select * from provider where location=?",[req.query.location],function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/angular-fetch-distinctprovider-location", function (req, resp) {
    mysql.query("select distinct location from provider ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/fetchcardbycityandsercat", function (req, resp) {
    mysql.query("select * from provider where location=? and category=?",[req.query.city,req.query.cat],function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/fetchcardbycityandserstate", function (req, resp) {
    mysql.query("select * from customprof where city=? and state=?",[req.query.city,req.query.state],function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})