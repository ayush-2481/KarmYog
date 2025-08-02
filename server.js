const express = require("express");
const app = express();
const mysql2 = require("mysql2")
const fileuploader = require("express-fileupload");
const path = require("path");
const cloudinary = require("cloudinary").v2;
// const obj = {
//     host: "127.0.0.1",
//     user: "root",
//     password: "Ayush@2481",
//     database: "project",
//     dateStrings: true // challange of time showing in IST
// }

// Online Database

cloudinary.config({ 
    cloud_name: 'dgzqwxjyz', 
    api_key: '533745967584789', 
    api_secret: 'KZarjThqQeWnOBY5FdMafXk__Yc' 
});

const obj = "mysql://avnadmin:AVNS_Y9MOkNSWqRrG5hKLoNZ@mysql-31b481bf-ayushsingla5552-f5ef.g.aivencloud.com:24567/defaultdb?ssl-mode=REQUIRED";
app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());

const mysql = mysql2.createConnection(obj);

mysql.connect(function (err) {
    if (err == null) {
        console.log("✅ Connected to database successfully");
        console.log("🔄 Updating database schema for longer addresses...");
        
        // Update customprof table address column
        mysql.query("ALTER TABLE customprof MODIFY COLUMN address TEXT", function(err, result) {
            if (err == null) {
                console.log("✅ customprof.address column updated to TEXT (65,535 chars)");
            } else {
                console.log("⚠️ customprof.address update:", err.message);
            }
        });
        
        // Update task table address column
        mysql.query("ALTER TABLE task MODIFY COLUMN address TEXT", function(err, result) {
            if (err == null) {
                console.log("✅ task.address column updated to TEXT (65,535 chars)");
            } else {
                console.log("⚠️ task.address update:", err.message);
            }
        });
        
        // Check table structure to debug column lengths
        mysql.query("DESCRIBE customprof", function(err, result) {
            if (err == null) {
                console.log("📋 customprof table structure verified");
            }
        });
        mysql.query("DESCRIBE task", function(err, result) {
            if (err == null) {
                console.log("📋 task table structure verified");
            }
        });
    }
    else {
        console.error("❌ Database connection failed:", err.message);
        console.error("Please check your database connection and try again.");
    }
})

app.listen(3004, function () {
    console.log("🚀 KarmYog Server is running!");
    console.log("📍 Server URL: http://localhost:3004");
    console.log("🏠 Home Page: http://localhost:3004/");
    console.log("👨‍💼 Provider Dashboard: http://localhost:3004/providerdash");
    console.log("🧪 Test Dashboard: http://localhost:3004/test-dashboard");
    console.log("📊 Admin Panel: http://localhost:3004/admin");
    console.log("===============================================");
    console.log("Server is ready to accept connections!");
})
app.use(express.static("public"));

app.get("/", function (req, resp) {
    let filePath = process.cwd() + "/index-new.html";
    resp.sendFile(filePath);
});

app.get("/old", function (req, resp) {
    let filePath = process.cwd() + "/index.html";
    resp.sendFile(filePath);
});

/*
// Serve static files from the "assets" directory
app.use(express.static(path.join(__dirname, "assets")));

// Route to serve the index.html file
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

*/
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
app.post("/profileLogin", function (req, resp) {
    const email = req.body.Email;
    const password = req.body.Pass;
    mysql.query("select * from users where emailid=? and pwd=?", [email, password], function (err, resultJsonArray) {
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


app.post("/custProfileSave",async function (req, resp) {
    const Email = req.body.txtEmailProf;
    const Fname = req.body.txtNameProf;
    const Lname = req.body.txtLnameProf;
    let address = req.body.txtAddProf;
    let num = req.body.txtNumProf;
    const userState = req.body.txtStateProf;
    const city = req.body.txtCityProf;

    // Validate and truncate address if too long (allowing up to 1000 chars)
    if (address && address.length > 1000) {
        console.log("Address truncated from", address.length, "to 1000 characters");
        address = address.substring(0, 1000);
    }

    // Remove any problematic characters that might cause database issues
    if (address) {
        address = address.replace(/[^\w\s\.\,\-\#\/\(\)\'\"\&\:\;\@]/g, '').trim();
    }

    // Validate and truncate contact number if too long (assuming VARCHAR(15))
    if (num && num.length > 15) {
        num = num.substring(0, 15);
    }

    let filename;

    filename = req.files.photo.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.photo.mv(path);//to store pic in uploads folder 
    // Cloudinary Url creater 
    await cloudinary.uploader.upload(path).then(result => {
        filename = result.url;
    })
    .catch(err=>{

    });
    req.body.photo = filename;
    console.log(req.body.txtEmailProf);

    mysql.query("insert into customprof values(?,?,?,?,?,?,?,?)", [Email, Fname, Lname, num, address, city, userState, filename], function (err) {
        if (err == null)
            resp.send("Record Saved Successfullyyy");
        else {
            console.log("Database Error:", err.message);
            console.log("Address length:", address ? address.length : 0);
            console.log("Address content preview:", address ? address.substring(0, 100) + "..." : "null");
            console.log("All data lengths:", {
                Email: Email ? Email.length : 0,
                Fname: Fname ? Fname.length : 0,
                Lname: Lname ? Lname.length : 0,
                num: num ? num.length : 0,
                address: address ? address.length : 0,
                city: city ? city.length : 0,
                userState: userState ? userState.length : 0,
                filename: filename ? filename.length : 0
            });
            resp.send("Database Error: " + err.message + " | Please check server console for details.");
        }
    })

})
//------------------------------------------------------
app.post("/custProfileUpdate", async function (req, resp) {
    const Email = req.body.txtEmailProf;
    const Fname = req.body.txtNameProf;
    const Lname = req.body.txtLnameProf;
    let address = req.body.txtAddProf;
    let num = req.body.txtNumProf;
    const userState = req.body.txtStateProf;
    const city = req.body.txtCityProf;

    // Validate and truncate address if too long (allowing up to 1000 chars)
    if (address && address.length > 1000) {
        console.log("Address truncated from", address.length, "to 1000 characters");
        address = address.substring(0, 1000);
    }

    // Remove any problematic characters that might cause database issues
    if (address) {
        address = address.replace(/[^\w\s\.\,\-\#\/\(\)\'\"\&\:\;\@]/g, '').trim();
    }

    // Validate and truncate contact number if too long (assuming VARCHAR(15))
    if (num && num.length > 15) {
        num = num.substring(0, 15);
    }

    let filename;
    if (req.files == null) {
        filename = req.body.hdn;
    }
    filename = req.files.photo.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.photo.mv(path);//to store pic in uploads folder 
    await cloudinary.uploader.upload(path).then(result=>{
        filename = result.url;
    })
    .catch(err=>{

    });
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
    const email = req.query.kuchEmail;
    console.log("Searching for email:", email);
    
    // First check if user exists in users table
    mysql.query("select * from users where emailid=?", [email], function (err, userResult) {
        if (err) {
            console.log("Database error checking users table:", err.message);
            resp.status(500).send({ error: "Database error: " + err.message });
            return;
        }
        
        if (userResult.length === 0) {
            console.log("User not found in users table");
            resp.status(404).send({ error: "User not registered. Please register first." });
            return;
        }
        
        console.log("User found in users table:", userResult[0]);
        
        // Check if user is a customer
        if (userResult[0].usertype !== 'customer') {
            resp.status(400).send({ error: "This email is not registered as a customer." });
            return;
        }
        
        // Now check if customer profile exists
        mysql.query("select * from customprof where emailid=?", [email], function (err, resultJsonArray) {
            if (err) {
                console.log("Database error in customprof:", err.message);
                resp.status(500).send({ error: "Database error: " + err.message });
            } else {
                console.log("Profile query result:", resultJsonArray);
                if (resultJsonArray.length === 0) {
                    resp.status(404).send({ error: "Customer profile not created yet. You can create a new profile." });
                } else {
                    resp.send(resultJsonArray);
                }
            }
        });
    });
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
    let Address = req.query.txtAdd;
    const City = req.query.txtCity;
    const Date = req.query.txtDate;
    const tasks = req.query.txttasks;

    // Validate and truncate address if too long (allowing up to 1000 chars)
    if (Address && Address.length > 1000) {
        console.log("Task Address truncated from", Address.length, "to 1000 characters");
        Address = Address.substring(0, 1000);
    }

    // Remove any problematic characters that might cause database issues
    if (Address) {
        Address = Address.replace(/[^\w\s\.\,\-\#\/\(\)\'\"\&\:\;\@]/g, '').trim();
    }

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

app.get("/test-dashboard", function (req, resp) {
    let filePath = process.cwd() + "/test-dashboard.html";
    resp.sendFile(filePath);
})

app.get("/providerprof", function (req, resp) {
    let filePath3 = process.cwd() + "/provider-profile.html";
    resp.sendFile(filePath3);
})
//--------------//
app.get("/fj", function (req, resp) {
    let filepath = process.cwd() + "/findjobsprovider.html";
    resp.sendFile(filepath);
  });
  
  app.get("/angular-fetch-alljobs", function (req, resp) {
    mysql.query("select * from task", function (err, result) {
      if (err) {
        resp.send(err.message);
        return;
      } else resp.send(result);
    });
  });
  //----------------------//
app.post("/provider-profile-save",async function (req, resp) {
    const emailadd = req.body.txtEmailProvider;
    const name = req.body.txtnamePro;
    let contact = req.body.txtnumberPro;
    const gender = req.body.txtgenderPro;
    const category = req.body.txtcategoryPro;
    const firm = req.body.txtfirmPro;
    const website = req.body.txtwebsitePro;
    const location = req.body.txtfirmaddPro;
    const since = req.body.txtworkPro;
    const otherinfo = req.body.txtselectPro;

    // Validate and truncate contact number if too long (assuming VARCHAR(15))
    if (contact && contact.length > 15) {
        contact = contact.substring(0, 15);
    }

    let filename;

    filename = req.files.txtpicPro.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.txtpicPro.mv(path);//to store pic in uploads folder 

    req.body.txtpicPro = filename;
    await cloudinary.uploader.upload(path)
    .then(result=>{
        filename = result.url;
    })
    .catch(err=>{

    });
    //console.log(req.query.txtEmailDash);

    mysql.query("insert into provider values(?,?,?,?,?,?,?,?,?,?,?)", [emailadd, name, contact, gender, category, firm, website, location, since, filename, otherinfo], function (err) {
        if (err == null)
            resp.send("Uploaded Successfully");
        else
            resp.send(err.message);

    })

})
//---------------------------------------
app.post("/Edit-Profile", async function (req, resp) {
    // console.log(req.body.txtnamePro);
    const EMAIL = req.body.txtEmailProvider;
    const name = req.body.txtnamePro;
    let Contact = req.body.txtnumberPro;
    const Gender = req.body.txtgenderPro;
    const Category = req.body.txtcategoryPro;
    const Firm = req.body.txtfirmPro;
    const Website = req.body.txtwebsitePro;
    const Location = req.body.txtfirmaddPro;
    const Since = req.body.txtworkPro;
    const Otherinfo = req.body.txtselectPro;

    // Validate and truncate contact number if too long (assuming VARCHAR(15))
    if (Contact && Contact.length > 15) {
        Contact = Contact.substring(0, 15);
    }

    let filename;

    filename = req.files.txtpicPro.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.txtpicPro.mv(path);//to store pic in uploads folder 
    await cloudinary.uploader.upload(path)
    .then(result=>{
        filename = result.url;
    })
    .catch(err=>{

    });
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

    mysql.query("select * from users where emailid=?", [email], function (err, result) {
        if (err) {
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
                mysql.query("update users set status=? where emailid=? ", [status, email], function (errr) {
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
    const email = req.query.Email;
    const status = 1;
    // console.log(req.query.email);

    mysql.query("select * from users where emailid=?", [email], function (err, result) {
        if (err) {
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
                mysql.query("update users set status=? where emailid=? ", [status, email], function (errr) {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const location = req.query.location || '';
    const sortBy = req.query.sortBy || 'Fname';
    const sortOrder = req.query.sortOrder || 'ASC';

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    // Add search functionality
    if (search) {
        whereClause += ' AND (Fname LIKE ? OR email LIKE ? OR category LIKE ? OR location LIKE ?)';
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add category filter
    if (category) {
        whereClause += ' AND category = ?';
        queryParams.push(category);
    }

    // Add location filter
    if (location) {
        whereClause += ' AND location = ?';
        queryParams.push(location);
    }

    // If no pagination requested, return simple data
    if (req.query.simple === 'true') {
        const simpleQuery = `SELECT * FROM provider ${whereClause} ORDER BY ${sortBy} ${sortOrder}`;
        mysql.query(simpleQuery, queryParams, function (err, resultJsonArray) {
            if (err) {
                resp.status(500).send({ error: 'Database error', details: err.message });
                return;
            }
            resp.send(resultJsonArray);
        });
        return;
    }

    // Count total records for pagination
    const countQuery = `SELECT COUNT(*) as total FROM provider ${whereClause}`;
    
    mysql.query(countQuery, queryParams, function (err, countResult) {
        if (err) {
            resp.status(500).send({ error: 'Database error while counting providers', details: err.message });
            return;
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Main query with pagination and sorting
        const mainQuery = `
            SELECT email, Fname, contact, gender, category, firm, website, location, 
                   since, profpic, otherinfo
            FROM provider 
            ${whereClause} 
            ORDER BY ${sortBy} ${sortOrder} 
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(limit, offset);

        mysql.query(mainQuery, queryParams, function (err, resultJsonArray) {
            if (err) {
                resp.status(500).send({ error: 'Database error while fetching providers', details: err.message });
                return;
            }

            // Enhanced response with metadata
            resp.send({
                providers: resultJsonArray,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecords: total,
                    recordsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                },
                filters: {
                    search: search,
                    category: category,
                    location: location,
                    sortBy: sortBy,
                    sortOrder: sortOrder
                }
            });
        });
    });
})
app.get("/provider-table", function (req, resp) {
    let filePath3 = process.cwd() + "/all-providers.html";
    resp.sendFile(filePath3);
})

// Get distinct categories for filtering
app.get("/angular-fetch-distinctprovider-category", function (req, resp) {
    mysql.query("SELECT DISTINCT category FROM provider WHERE category IS NOT NULL AND category != '' ORDER BY category", 
        function (err, resultJsonArray) {
            if (err) {
                resp.status(500).send({ error: 'Database error while fetching categories', details: err.message });
                return;
            }
            resp.send(resultJsonArray);
        }
    );
})

// Get distinct locations for filtering
app.get("/angular-fetch-distinctprovider-location", function (req, resp) {
    mysql.query("SELECT DISTINCT location FROM provider WHERE location IS NOT NULL AND location != '' ORDER BY location", 
        function (err, resultJsonArray) {
            if (err) {
                resp.status(500).send({ error: 'Database error while fetching locations', details: err.message });
                return;
            }
            resp.send(resultJsonArray);
        }
    );
})

// Get providers by category (enhanced)
app.get("/angular-fetchprovidercategory", function (req, resp) {
    const category = req.query.category;
    if (!category) {
        resp.status(400).send({ error: 'Category parameter is required' });
        return;
    }

    mysql.query("SELECT * FROM provider WHERE category = ? ORDER BY Fname", [category], 
        function (err, resultJsonArray) {
            if (err) {
                resp.status(500).send({ error: 'Database error while fetching providers by category', details: err.message });
                return;
            }
            resp.send(resultJsonArray);
        }
    );
})

// Get providers by location
app.get("/angular-fetchproviderlocation", function (req, resp) {
    const location = req.query.location;
    if (!location) {
        resp.status(400).send({ error: 'Location parameter is required' });
        return;
    }

    mysql.query("SELECT * FROM provider WHERE location = ? ORDER BY Fname", [location], 
        function (err, resultJsonArray) {
            if (err) {
                resp.status(500).send({ error: 'Database error while fetching providers by location', details: err.message });
                return;
            }
            resp.send(resultJsonArray);
        }
    );
})

// Get provider details by email
app.get("/angular-fetchprovider-details", function (req, resp) {
    const email = req.query.email;
    if (!email) {
        resp.status(400).send({ error: 'Email parameter is required' });
        return;
    }

    mysql.query("SELECT * FROM provider WHERE email = ?", [email], 
        function (err, resultJsonArray) {
            if (err) {
                resp.status(500).send({ error: 'Database error while fetching provider details', details: err.message });
                return;
            }
            
            if (resultJsonArray.length === 0) {
                resp.status(404).send({ error: 'Provider not found' });
                return;
            }
            
            resp.send(resultJsonArray[0]);
        }
    );
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
    mysql.query("select * from customprof where city=?", [req.query.city], function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
// app.get("/angular-fetch-distinctcustomer-states", function (req, resp) {
//     mysql.query("select distinct state from customprof ", function (err, resultJsonArray) {
//         resp.send(resultJsonArray);
//     })
// })
app.get("/angular-fetchcustomerstates", function (req, resp) {
    mysql.query("select * from customprof where city=?", [req.query.city], function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/customer-table", function (req, resp) {
    let filePath3 = process.cwd() + "/all-customers.html";
    resp.sendFile(filePath3);
})
app.get("/angular-fetchproviderdash-all", function (req, resp) {
    console.log("Provider endpoint called");
    mysql.query("select * from provider ", function (err, resultJsonArray) {
        if (err) {
            console.error("Provider query error:", err);
            resp.status(500).json({ error: err.message });
            return;
        }
        console.log("Provider query success, rows:", resultJsonArray ? resultJsonArray.length : 0);
        
        // Debug: Log the first provider's structure to understand column names
        if (resultJsonArray && resultJsonArray.length > 0) {
            console.log("First provider data structure:", resultJsonArray[0]);
            console.log("Column names:", Object.keys(resultJsonArray[0]));
        }
        
        resp.send(resultJsonArray);
    })
})
app.get("/providerdash-table", function (req, resp) {
    let filePath3 = process.cwd() + "/all-providersdash.html";
    resp.sendFile(filePath3);
})

// Debug endpoint to check database
app.get("/debug-providers", function (req, resp) {
    mysql.query("SELECT COUNT(*) as count FROM provider", function (err, countResult) {
        if (err) {
            resp.json({ error: err.message });
            return;
        }
        
        mysql.query("SELECT * FROM provider LIMIT 5", function (err2, providers) {
            if (err2) {
                resp.json({ error: err2.message });
                return;
            }
            
            resp.json({
                totalCount: countResult[0].count,
                sampleData: providers,
                timestamp: new Date().toISOString()
            });
        });
    });
});

// Simple connectivity test
app.get("/test-db", function (req, resp) {
    mysql.query("SELECT 1 as test", function (err, result) {
        if (err) {
            resp.json({ status: "error", message: err.message });
        } else {
            resp.json({ status: "success", result: result, timestamp: new Date() });
        }
    });
});

// Endpoint to describe provider table structure
app.get("/describe-provider-table", function (req, resp) {
    mysql.query("DESCRIBE provider", function (err, resultJsonArray) {
        if (err) {
            console.error("Provider describe error:", err);
            resp.status(500).json({ error: err.message });
            return;
        }
        console.log("Provider table structure:", resultJsonArray);
        resp.json({
            success: true,
            tableStructure: resultJsonArray
        });
    });
});

// Endpoint to create sample provider data for testing
app.get("/create-sample-providers", function (req, resp) {
    const sampleProviders = [
        ['john.plumber@gmail.com', 'John Smith', '9876543210', 'Male', 'Plumbing', 'Smith Plumbing Services', 'www.smithplumbing.com', 'New Delhi', '2018', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Experienced plumber with 5+ years experience'],
        ['sarah.electrician@gmail.com', 'Sarah Johnson', '9876543211', 'Female', 'Electrical', 'Johnson Electric', 'www.johnsonelectric.com', 'Mumbai', '2019', 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=400', 'Licensed electrician specializing in residential work'],
        ['mike.carpenter@gmail.com', 'Mike Wilson', '9876543212', 'Male', 'Carpentry', 'Wilson Woodworks', '', 'Bangalore', '2017', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Custom furniture and home carpentry'],
        ['lisa.cleaner@gmail.com', 'Lisa Brown', '9876543213', 'Female', 'Cleaning', 'Brown Cleaning Co', '', 'Chennai', '2020', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'Professional house cleaning services'],
        ['david.painter@gmail.com', 'David Lee', '9876543214', 'Male', 'Painting', 'Lee Painters', 'www.leepainters.com', 'Pune', '2016', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Interior and exterior painting specialist'],
        ['anna.gardener@gmail.com', 'Anna Garcia', '9876543215', 'Female', 'Gardening', 'Garcia Gardens', '', 'Hyderabad', '2019', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'Landscape design and garden maintenance'],
        ['robert.mechanic@gmail.com', 'Robert Taylor', '9876543216', 'Male', 'Automobile', 'Taylor Auto Repair', '', 'Kolkata', '2015', 'https://images.unsplash.com/photo-1507038732509-8b1a3cd5a71c?w=400', 'Car and bike repair services'],
        ['emma.tutor@gmail.com', 'Emma White', '9876543217', 'Female', 'Education', 'White Tutoring', '', 'Ahmedabad', '2021', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Math and science tutoring for all grades']
    ];

    let insertCount = 0;
    let errors = [];

    sampleProviders.forEach((provider, index) => {
        mysql.query("INSERT INTO provider VALUES (?,?,?,?,?,?,?,?,?,?,?)", provider, function (err) {
            insertCount++;
            if (err) {
                errors.push(`Provider ${index + 1}: ${err.message}`);
            }
            
            // Check if all inserts are complete
            if (insertCount === sampleProviders.length) {
                if (errors.length === 0) {
                    resp.json({ 
                        success: true, 
                        message: `Successfully created ${sampleProviders.length} sample providers`,
                        providersCreated: sampleProviders.length
                    });
                } else {
                    resp.json({ 
                        success: false, 
                        message: "Some providers failed to create",
                        errors: errors,
                        providersCreated: sampleProviders.length - errors.length
                    });
                }
            }
        });
    });
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
    mysql.query("select * from task where city=?", [req.query.city], function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
// app.get("/angular-fetch-distinctprovider-category", function (req, resp) {
//     mysql.query("select distinct category from provider ", function (err, resultJsonArray) {
//         resp.send(resultJsonArray);
//     })
// })
app.get("/doShowprovidercategory", function (req, resp) {
    mysql.query("select * from provider where location=?", [req.query.location], function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/angular-fetch-distinctprovider-location", function (req, resp) {
    mysql.query("select distinct location from provider ", function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/fetchcardbycityandsercat", function (req, resp) {
    mysql.query("select * from provider where location=? and category=?", [req.query.city, req.query.cat], function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})
app.get("/fetchcardbycityandserstate", function (req, resp) {
    mysql.query("select * from customprof where city=? and state=?", [req.query.city, req.query.state], function (err, resultJsonArray) {
        resp.send(resultJsonArray);
    })
})

// Customer Dashboard Statistics API
app.get("/customer-stats", function (req, resp) {
    const email = req.query.email;
    
    // Get statistics for customer dashboard
    const stats = {};
    
    // Count active jobs for this customer
    mysql.query("SELECT COUNT(*) as activeJobs FROM task WHERE emailid=?", [email], function (err, result) {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }
        stats.activeJobs = result[0].activeJobs;
        
        // Count total completed jobs (assuming completed status or date-based logic)
        mysql.query("SELECT COUNT(*) as completedJobs FROM task WHERE emailid=? AND taskdate < CURDATE()", [email], function (err, result) {
            if (err) {
                stats.completedJobs = 0;
            } else {
                stats.completedJobs = result[0].completedJobs;
            }
            
            // Count unique providers contacted (this is an approximation)
            mysql.query("SELECT COUNT(DISTINCT category) as providers FROM task WHERE emailid=?", [email], function (err, result) {
                if (err) {
                    stats.providers = 0;
                } else {
                    stats.providers = result[0].providers;
                }
                
                // Count jobs this month
                mysql.query("SELECT COUNT(*) as thisMonth FROM task WHERE emailid=? AND MONTH(taskdate) = MONTH(CURDATE()) AND YEAR(taskdate) = YEAR(CURDATE())", [email], function (err, result) {
                    if (err) {
                        stats.thisMonth = 0;
                    } else {
                        stats.thisMonth = result[0].thisMonth;
                    }
                    
                    resp.send(stats);
                });
            });
        });
    });
})

// Provider Dashboard Statistics API
app.get("/provider-stats", function (req, resp) {
    const email = req.query.email;
    
    if (!email) {
        resp.status(400).send({ error: "Email is required" });
        return;
    }
    
    const stats = {};
    
    // Count available jobs (total jobs in the system)
    mysql.query("SELECT COUNT(*) as availableJobs FROM task", function (err, result) {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }
        stats.availableJobs = result[0].availableJobs;
        
        // Get completed jobs for this provider (assuming we track this in task table)
        mysql.query("SELECT COUNT(*) as completedJobs FROM task WHERE provider_email = ? AND status = 'completed'", [email], function (err, result) {
            if (err) {
                stats.completedJobs = 0;
            } else {
                stats.completedJobs = result[0].completedJobs;
            }
            
            // Calculate total earnings (mock calculation based on completed jobs)
            stats.totalEarnings = stats.completedJobs * 2500; // Average ₹2500 per job
            
            // Count jobs this month
            mysql.query("SELECT COUNT(*) as thisMonth FROM task WHERE MONTH(taskdate) = MONTH(CURDATE()) AND YEAR(taskdate) = YEAR(CURDATE())", function (err, result) {
                if (err) {
                    stats.thisMonth = 0;
                } else {
                    stats.thisMonth = result[0].thisMonth;
                }
                
                resp.send(stats);
            });
        });
    });
})

// Add endpoint to fetch provider details
app.get("/fetch-provider-details", function (req, resp) {
    const email = req.query.email;
    
    if (!email) {
        resp.status(400).send({ error: "Email is required" });
        return;
    }
    
    mysql.query("SELECT * FROM provider WHERE email = ?", [email], function (err, resultJsonArray) {
        if (err) {
            resp.status(500).send({ error: err.message });
        } else {
            resp.send(resultJsonArray);
        }
    });
})

// Admin Dashboard Statistics API
app.get("/admin-stats", function (req, resp) {
    const stats = {};
    
    // Count total users
    mysql.query("SELECT COUNT(*) as totalUsers FROM users", function (err, result) {
        if (err) {
            resp.status(500).send({ error: err.message });
            return;
        }
        stats.totalUsers = result[0].totalUsers;
        
        // Count active providers (from users table with usertype = 'Provider')
        mysql.query("SELECT COUNT(*) as activeProviders FROM users WHERE usertype = 'Provider' AND status = '1'", function (err, result) {
            if (err) {
                stats.activeProviders = 0;
            } else {
                stats.activeProviders = result[0].activeProviders;
            }
            
            // Count total jobs/tasks
            mysql.query("SELECT COUNT(*) as totalJobs FROM task", function (err, result) {
                if (err) {
                    stats.totalJobs = 0;
                } else {
                    stats.totalJobs = result[0].totalJobs;
                }
                
                // Count new registrations this month (both customers and providers)
                mysql.query("SELECT COUNT(*) as newThisMonth FROM users WHERE MONTH(STR_TO_DATE(dos, '%Y-%m-%d')) = MONTH(CURDATE()) AND YEAR(STR_TO_DATE(dos, '%Y-%m-%d')) = YEAR(CURDATE())", function (err, result) {
                    if (err) {
                        stats.newThisMonth = 0;
                    } else {
                        stats.newThisMonth = result[0].newThisMonth;
                    }
                    
                    // Additional stats for more insights
                    mysql.query("SELECT COUNT(*) as totalCustomers FROM users WHERE usertype = 'Customer'", function (err, result) {
                        if (err) {
                            stats.totalCustomers = 0;
                        } else {
                            stats.totalCustomers = result[0].totalCustomers;
                        }
                        
                        // Count pending jobs
                        mysql.query("SELECT COUNT(*) as pendingJobs FROM task WHERE status = 'pending'", function (err, result) {
                            if (err) {
                                stats.pendingJobs = 0;
                            } else {
                                stats.pendingJobs = result[0].pendingJobs;
                            }
                            
                            resp.send(stats);
                        });
                    });
                });
            });
        });
    });
})