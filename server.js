const express = require("express");
const app = express();
const mysql2 = require("mysql2")
const fileuploader = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'dgzqwxjyz', 
    api_key: '533745967584789', 
    api_secret: 'KZarjThqQeWnOBY5FdMafXk__Yc' 
});

// Database configuration with connection pooling
const dbConfig = {
    connectionLimit: 10,
    host: 'mysql-31b481bf-ayushsingla5552-f5ef.g.aivencloud.com',
    port: 24567,
    user: 'avnadmin',
    password: 'AVNS_Y9MOkNSWqRrG5hKLoNZ',
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false
    },
    dateStrings: true
};

// Create connection pool instead of single connection
const mysql = mysql2.createPool(dbConfig);

// Test the connection pool
mysql.getConnection((err, connection) => {
    if (err == null) {
        console.log("✅ Connected to database successfully");
        connection.release(); // Release the connection back to the pool
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
        console.error("Database URL:", dbConfig ? "Connected to cloud database" : "No database config");
        console.error("Please check your database connection and try again.");
        
        // Continue running the server even if database connection fails
        console.log("⚠️ Server will continue running without database functionality");
    }
});

app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());

// Helper function to execute queries with proper connection handling
function executeQuery(query, params, callback) {
    mysql.getConnection((err, connection) => {
        if (err) {
            console.error("❌ Database connection error:", err.message);
            return callback(err, null);
        }
        
        connection.query(query, params, (queryErr, results) => {
            connection.release(); // Always release the connection
            
            if (queryErr) {
                console.error("❌ Query execution error:", queryErr.message);
                return callback(queryErr, null);
            }
            
            callback(null, results);
        });
    });
}

// For Render deployment - listen on the PORT environment variable
const PORT = process.env.PORT || 3004;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, function () {
    console.log("🚀 KarmYog Server is running!");
    console.log(`📍 Server running on: ${HOST}:${PORT}`);
    console.log(`� Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log("🏠 Available Routes:");
    console.log(`  GET / - Home Page`);
    console.log(`  GET /providerdash - Provider Dashboard`);
    console.log(`  GET /test-dashboard - Test Dashboard`);
    console.log(`  GET /admin - Admin Panel`);
    console.log(`  GET /health - Health Check`);
    console.log("===============================================");
    console.log("Server is ready to accept connections!");
})
app.use(express.static("public"));

// Health check endpoint for Render
app.get("/health", function (req, resp) {
    resp.status(200).json({ 
        status: "OK", 
        message: "KarmYog Server is running",
        timestamp: new Date().toISOString(),
        routes: {
            home: "/",
            providerAccess: "/provider-access",
            providerDashboard: "/providerdash",
            providerDashboardDirect: "/service-providerdashboard.html",
            providerProfile: "/providerprof",
            testDashboard: "/test-dashboard",
            debugDashboard: "/debug-dashboard",
            admin: "/admin",
            allProviders: "/all-providersdash-improved",
            viewProviders: "/view-providers",
            providersDashboard: "/providers-dashboard",
            createDemoProvider: "/create-demo-provider",
            createRobertProvider: "/create-robert-provider",
            testProvider: "/test-provider",
            testProviderSearch: "/test-provider-search",
            customerProfile: "/profile-customer.html",
            customerDashboard: "/customerDash",
            testCustomerSearch: "/test-customer-search",
            fixCustomerSearch: "/fix-customer-search",
            createTestCustomer: "/create-test-customer",
            debugCustomer: "/debug-customer",
            sampleData: "/sample-data",
            testSignupNavigation: "/test-signup-navigation"
        },
        tips: {
            loginIssue: "If dashboard shows login required, use Demo Mode or enter email: demo@provider.com",
            demoUser: "Visit /create-demo-provider to create test data",
            customerSearchIssue: "If customer search fails, visit /fix-customer-search to diagnose and fix",
            testCustomer: "Use /create-test-customer to create test customer data"
        }
    });
});

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

    executeQuery("Insert into users values(?,?,?,current_date(),?)", [email, password, usertype, status], function (err) {
        if (err == null) {
            resp.send("Sign Up Successfully!!!");
        }
        else {
            resp.send("Database error: " + err.message)
        }
    })
})
//------------------------------------------------
app.get("/check-User", function (req, resp) {
    executeQuery("select * from users where emailid=?", [req.query.kuchEmail], function (err, resultJsonArray) {
        if (err) {
            resp.send("Database error: " + err.message);
            return;
        }
        if (resultJsonArray.length == 1)
            resp.send("Email already exists");
        else
            resp.send("Yess!!! Available");
    })
})


//-------------------------------------------------
app.get("/checkUserLogin", function (req, resp) {
    executeQuery("select * from users where emailid=?", [req.query.kuchEmail], function (err, resultJsonArray) {
        if (err) {
            resp.send("Database error: " + err.message);
            return;
        }
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

    executeQuery("update users set pwd=? where emailid=? and pwd=?", [newpass, email, oldpass], function (err) {
        if (err == null) {
            resp.send("PASSWORD CHANGED SUCCESSFULLY");
        }
        else {
            resp.send("Database error: " + err.message);
        }
    })
})
//------------------------------------------------
app.post("/profileLogin", function (req, resp) {
    const email = req.body.Email;
    const password = req.body.Pass;
    executeQuery("select * from users where emailid=? and pwd=?", [email, password], function (err, resultJsonArray) {
        if (err) {
            resp.send("Database error: " + err.message);
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

    executeQuery("insert into customprof (emailid, Fname, Lname, contact, address, city, state, picname) values(?,?,?,?,?,?,?,?)", [Email, Fname, Lname, num, address, city, userState, filename], function (err) {
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

    executeQuery("update customprof set Fname=?,Lname=?,contact=?,address=?,city=?,state=?,picname=? where emailid=?", [Fname, Lname, num, address, city, userState, filename, Email], function (err) {
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
    
    // Enhanced debugging
    console.log("🔍 fetch-one: === DEBUG START ===");
    console.log("🔍 fetch-one: Raw query parameters:", req.query);
    console.log("🔍 fetch-one: kuchEmail parameter:", email);
    console.log("🔍 fetch-one: Email type:", typeof email);
    console.log("🔍 fetch-one: Email length:", email ? email.length : 'undefined');
    console.log("🔍 fetch-one: Email trimmed:", email ? email.trim() : 'undefined');
    console.log("🔍 fetch-one: Email trimmed length:", email ? email.trim().length : 'undefined');
    console.log("🔍 fetch-one: === DEBUG END ===");
    
    // More robust email validation
    if (!email) {
        console.log("❌ fetch-one: Email parameter is missing");
        resp.status(400).json({ error: "Email parameter (kuchEmail) is required" });
        return;
    }
    
    const trimmedEmail = email.trim();
    if (trimmedEmail === '') {
        console.log("❌ fetch-one: Email parameter is empty after trimming");
        resp.status(400).json({ error: "Email parameter cannot be empty" });
        return;
    }
    
    // Basic email format validation
    if (!trimmedEmail.includes('@')) {
        console.log("❌ fetch-one: Email parameter does not contain @ symbol");
        resp.status(400).json({ error: "Invalid email format - missing @ symbol" });
        return;
    }
    
    console.log("✅ fetch-one: Email validation passed, proceeding with search");
    console.log("🔍 fetch-one: Searching for customer profile with email:", trimmedEmail);
    
    // Search directly in customprof table (just like provider profile search)
    executeQuery("select * from customprof where emailid=?", [trimmedEmail], function (err, resultJsonArray) {
        if (err) {
            console.log("❌ fetch-one: Database error in customprof:", err.message);
            resp.status(500).json({ error: "Database error: " + err.message });
            return;
        }
        
        console.log("🔍 fetch-one: customprof query result:", resultJsonArray.length, "records found");
        
        if (resultJsonArray.length === 0) {
            console.log("📝 fetch-one: No customer profile found for email:", trimmedEmail);
            // Return empty array with 200 status (same as successful search with no results)
            resp.json([]);
        } else {
            console.log("✅ fetch-one: Customer profile found, sending data");
            resp.json(resultJsonArray);
        }
    });
})
//-----------------------------------------------
// Debug endpoint to check database contents
app.get("/debug-customer", function (req, resp) {
    const email = req.query.email;
    console.log("🔧 Debug: Checking database for email:", email);
    
    if (!email) {
        resp.json({ error: "Email parameter required" });
        return;
    }
    
    // Check users table
    executeQuery("select emailid, usertype from users where emailid=?", [email], function (err, userResult) {
        if (err) {
            resp.json({ error: "Database error in users table: " + err.message });
            return;
        }
        
        // Check customprof table
        executeQuery("select emailid, Fname, Lname from customprof where emailid=?", [email], function (err2, profileResult) {
            if (err2) {
                resp.json({ error: "Database error in customprof table: " + err2.message });
                return;
            }
            
            resp.json({
                email: email,
                userTableResult: userResult,
                profileTableResult: profileResult,
                summary: {
                    userExists: userResult.length > 0,
                    userType: userResult.length > 0 ? userResult[0].usertype : null,
                    profileExists: profileResult.length > 0,
                    canFetchProfile: userResult.length > 0 && userResult[0].usertype === 'customer' && profileResult.length > 0
                }
            });
        });
    });
})
//-----------------------------------------------
// Sample data endpoint to check what's in the database
app.get("/sample-data", function (req, resp) {
    console.log("🔧 Getting sample data from database");
    
    // Get some users
    mysql.query("select emailid, usertype from users limit 5", function (err, users) {
        if (err) {
            resp.json({ error: "Error fetching users: " + err.message });
            return;
        }
        
        // Get some customer profiles
        mysql.query("select emailid, Fname, Lname from customprof limit 5", function (err2, profiles) {
            if (err2) {
                resp.json({ error: "Error fetching profiles: " + err2.message });
                return;
            }
            
            resp.json({
                users: users,
                profiles: profiles,
                userCount: users.length,
                profileCount: profiles.length
            });
        });
    });
})
//-----------------------------------------------
// Table structure endpoint
app.get("/table-structure", function (req, resp) {
    console.log("🔧 Getting table structure");
    
    mysql.query("DESCRIBE users", function (err, usersStructure) {
        if (err) {
            resp.json({ error: "Error describing users table: " + err.message });
            return;
        }
        
        mysql.query("DESCRIBE customprof", function (err2, profStructure) {
            if (err2) {
                resp.json({ error: "Error describing customprof table: " + err2.message });
                return;
            }
            
            resp.json({
                users: usersStructure,
                customprof: profStructure
            });
        });
    });
})
//-----------------------------------------------
// Create test customer endpoint
app.get("/create-test-customer", function (req, resp) {
    const testEmail = "testcustomer@example.com";
    const testPassword = "test123";
    
    console.log("🧪 Creating test customer:", testEmail);
    
    // First check if user already exists
    executeQuery("select * from users where emailid=?", [testEmail], function (err, existing) {
        if (err) {
            resp.json({ error: "Database error checking existing user: " + err.message });
            return;
        }
        
        function createProfile() {
            // Check if profile already exists
            executeQuery("select * from customprof where emailid=?", [testEmail], function (err, existingProfile) {
                if (err) {
                    resp.json({ error: "Database error checking existing profile: " + err.message });
                    return;
                }
                
                if (existingProfile.length > 0) {
                    resp.json({
                        success: true,
                        message: "Test customer and profile already exist",
                        user: existing[0],
                        profile: existingProfile[0]
                    });
                    return;
                }
                
                // Create customer profile
                executeQuery("insert into customprof (emailid, Fname, Lname, contact, address, city, state, picname) values(?,?,?,?,?,?,?,?)", 
                    [testEmail, "Test", "Customer", "9999999999", "123 Test Street, Test City", "Test City", "Test State", "https://via.placeholder.com/150"], 
                    function (err) {
                        if (err) {
                            resp.json({ error: "Error creating customer profile: " + err.message });
                            return;
                        }
                        
                        resp.json({
                            success: true,
                            message: "Test customer profile created successfully",
                            email: testEmail,
                            userType: "customer"
                        });
                    });
            });
        }
        
        if (existing.length > 0) {
            console.log("✅ Test user already exists, checking/creating profile");
            createProfile();
        } else {
            // Create user first
            executeQuery("Insert into users values(?,?,?,current_date(),?)", [testEmail, testPassword, "customer", 1], function (err) {
                if (err) {
                    resp.json({ error: "Error creating test user: " + err.message });
                    return;
                }
                
                console.log("✅ Test user created, creating profile");
                createProfile();
            });
        }
    });
})
//-----------------------------------------------
// Test customer search page
app.get("/test-customer-search", function (req, resp) {
    let filePath = process.cwd() + "/test-customer-search.html";
    resp.sendFile(filePath);
})
//-----------------------------------------------
// Fix customer search page
app.get("/fix-customer-search", function (req, resp) {
    let filePath = process.cwd() + "/fix-customer-search.html";
    resp.sendFile(filePath);
})
//-----------------------------------------------
// Endpoint to fix user type
app.get("/fix-user-type", function (req, resp) {
    const email = req.query.email;
    const newUserType = req.query.usertype || 'customer';
    
    if (!email) {
        resp.status(400).json({ error: "Email parameter is required" });
        return;
    }
    
    console.log("🔧 Fixing user type for:", email, "to:", newUserType);
    
    // First check if user exists
    executeQuery("select * from users where emailid=?", [email], function (err, userResult) {
        if (err) {
            resp.status(500).json({ error: "Database error: " + err.message });
            return;
        }
        
        if (userResult.length === 0) {
            resp.status(404).json({ error: "User not found with email: " + email });
            return;
        }
        
        const currentUserType = userResult[0].usertype;
        
        if (currentUserType === newUserType) {
            resp.json({
                success: true,
                message: `User is already set as ${newUserType}`,
                email: email,
                userType: currentUserType
            });
            return;
        }
        
        // Update user type
        executeQuery("update users set usertype=? where emailid=?", [newUserType, email], function (err) {
            if (err) {
                resp.status(500).json({ error: "Error updating user type: " + err.message });
                return;
            }
            
            resp.json({
                success: true,
                message: `User type updated successfully from '${currentUserType}' to '${newUserType}'`,
                email: email,
                oldUserType: currentUserType,
                newUserType: newUserType
            });
        });
    });
})
//-----------------------------------------------
// Quick fix for customer profile search issues
app.get("/quick-fix-customer", function (req, resp) {
    const email = req.query.email;
    
    if (!email) {
        resp.status(400).json({ error: "Email parameter is required" });
        return;
    }
    
    console.log("🔧 Quick fix for customer:", email);
    
    // First check if user exists
    executeQuery("select * from users where emailid=?", [email], function (err, userResult) {
        if (err) {
            resp.status(500).json({ error: "Database error: " + err.message });
            return;
        }
        
        if (userResult.length === 0) {
            // User doesn't exist, create as customer
            console.log("👤 Creating new customer user:", email);
            executeQuery("Insert into users values(?,?,?,current_date(),?)", [email, "temp123", "Customer", 1], function (err) {
                if (err) {
                    resp.status(500).json({ error: "Error creating user: " + err.message });
                    return;
                }
                
                resp.json({
                    success: true,
                    action: "created",
                    message: "New customer user created successfully",
                    email: email,
                    userType: "Customer",
                    tempPassword: "temp123",
                    note: "User created with temporary password 'temp123'. Please update the password."
                });
            });
        } else {
            // User exists, check/fix user type
            const currentUserType = userResult[0].usertype;
            console.log("👤 User exists with type:", currentUserType);
            
            if (currentUserType.toLowerCase() === 'customer') {
                resp.json({
                    success: true,
                    action: "already_customer",
                    message: "User is already a customer",
                    email: email,
                    userType: currentUserType
                });
            } else {
                // Convert to customer
                console.log("🔄 Converting user to customer type");
                executeQuery("update users set usertype=? where emailid=?", ["Customer", email], function (err) {
                    if (err) {
                        resp.status(500).json({ error: "Error updating user type: " + err.message });
                        return;
                    }
                    
                    resp.json({
                        success: true,
                        action: "converted",
                        message: `User type updated from '${currentUserType}' to 'Customer'`,
                        email: email,
                        oldUserType: currentUserType,
                        newUserType: "Customer"
                    });
                });
            }
        }
    });
})
//-----------------------------------------------
// Test signup and navigation changes page
app.get("/test-signup-navigation", function (req, resp) {
    let filePath = process.cwd() + "/test-signup-navigation.html";
    resp.sendFile(filePath);
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
app.get("/provider-access", function (req, resp) {
    console.log("🚪 Provider Access page requested");
    let filePath = process.cwd() + "/provider-access.html";
    resp.sendFile(filePath);
})

//Route for direct file access
app.get("/service-providerdashboard.html", function (req, resp) {
    console.log("📊 Provider Dashboard requested (direct file access)");
    let filePath3 = process.cwd() + "/service-providerdashboard.html";
    resp.sendFile(filePath3);
})

app.get("/providerdash", function (req, resp) {
    console.log("📊 Provider Dashboard requested");
    try {
        let filePath3 = process.cwd() + "/service-providerdashboard.html";
        console.log("📁 Serving file from:", filePath3);
        
        // Check if file exists
        const fs = require('fs');
        if (fs.existsSync(filePath3)) {
            console.log("✅ Provider dashboard file found");
            resp.sendFile(filePath3);
        } else {
            console.error("❌ Provider dashboard file not found at:", filePath3);
            resp.status(404).send(`
                <h1>Provider Dashboard Not Found</h1>
                <p>The service provider dashboard file could not be found.</p>
                <p>File path: ${filePath3}</p>
                <p><a href="/">Go back to home</a></p>
                <p><a href="/test-dashboard">Try test dashboard</a></p>
            `);
        }
    } catch (error) {
        console.error("❌ Error serving provider dashboard:", error);
        resp.status(500).send(`
            <h1>Server Error</h1>
            <p>Error loading provider dashboard: ${error.message}</p>
            <p><a href="/">Go back to home</a></p>
        `);
    }
})

app.get("/debug-dashboard", function (req, resp) {
    console.log("🔍 Debug Dashboard requested");
    let filePath = process.cwd() + "/debug-dashboard.html";
    resp.sendFile(filePath);
})

app.get("/test-dashboard", function (req, resp) {
    console.log("🧪 Test Dashboard requested");
    try {
        let filePath = process.cwd() + "/test-dashboard.html";
        console.log("📁 Serving test dashboard from:", filePath);
        
        if (fs.existsSync(filePath)) {
            console.log("✅ Test dashboard file found");
            resp.sendFile(filePath);
        } else {
            console.error("❌ Test dashboard file not found, creating temporary one");
            // Create a temporary test dashboard inline
            resp.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>KarmYog Test Dashboard</title>
                    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
                        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
                        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
                    </style>
                </head>
                <body>
                    <h1>🧪 KarmYog Test Dashboard</h1>
                    <div class="status info">
                        <strong>Server Status:</strong> Running on Render<br>
                        <strong>Current URL:</strong> <span id="currentUrl"></span><br>
                        <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}
                    </div>
                    
                    <h2>🔗 Available Routes:</h2>
                    <ul>
                        <li><a href="/">Home Page</a></li>
                        <li><a href="/providerdash">Provider Dashboard</a></li>
                        <li><a href="/all-providersdash-improved">All Providers (Improved)</a></li>
                        <li><a href="/view-providers">View Providers</a></li>
                        <li><a href="/admin">Admin Panel</a></li>
                        <li><a href="/health">Health Check</a></li>
                    </ul>
                    
                    <h2>🔧 Quick Tests:</h2>
                    <button onclick="testHealth()">Test Health Check</button>
                    <button onclick="testProviderStats()">Test Provider Stats</button>
                    <button onclick="setTestUser()">Set Test User</button>
                    <button onclick="testDashboard()">Go to Provider Dashboard</button>
                    
                    <div id="results"></div>
                    
                    <script>
                        document.getElementById('currentUrl').textContent = window.location.href;
                        
                        function testHealth() {
                            fetch('/health')
                                .then(response => response.json())
                                .then(data => {
                                    document.getElementById('results').innerHTML = 
                                        '<div class="status success">Health Check: ' + JSON.stringify(data, null, 2) + '</div>';
                                })
                                .catch(error => {
                                    document.getElementById('results').innerHTML = 
                                        '<div class="status error">Health Check Failed: ' + error.message + '</div>';
                                });
                        }
                        
                        function testProviderStats() {
                            fetch('/provider-stats?email=test@example.com')
                                .then(response => response.json())
                                .then(data => {
                                    document.getElementById('results').innerHTML = 
                                        '<div class="status success">Provider Stats: ' + JSON.stringify(data, null, 2) + '</div>';
                                })
                                .catch(error => {
                                    document.getElementById('results').innerHTML = 
                                        '<div class="status error">Provider Stats Failed: ' + error.message + '</div>';
                                });
                        }
                        
                        function setTestUser() {
                            localStorage.setItem("User", "provider@test.com");
                            document.getElementById('results').innerHTML = 
                                '<div class="status success">Test user set: provider@test.com</div>';
                        }
                        
                        function testDashboard() {
                            window.location.href = '/providerdash';
                        }
                    </script>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error("❌ Error serving test dashboard:", error);
        resp.status(500).send("Error loading test dashboard: " + error.message);
    }
})

app.get("/logout", function (req, resp) {
    // Simple logout redirect to home page
    resp.redirect("/");
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
    try {
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

        let filename = '';

        // Handle file upload if file is provided
        if (req.files && req.files.txtpicPro) {
            filename = req.files.txtpicPro.name;
            let path = process.cwd() + "/public/uploads/" + filename;
            req.files.txtpicPro.mv(path);//to store pic in uploads folder 

            req.body.txtpicPro = filename;
            await cloudinary.uploader.upload(path)
            .then(result=>{
                filename = result.url;
            })
            .catch(err=>{
                console.error("Cloudinary upload error:", err);
                filename = 'uploads/' + req.files.txtpicPro.name; // fallback to local path
            });
        }

        mysql.query("insert into provider values(?,?,?,?,?,?,?,?,?,?,?)", [emailadd, name, contact, gender, category, firm, website, location, since, filename, otherinfo], function (err) {
            if (err == null) {
                resp.json({ 
                    success: true, 
                    message: "Profile saved successfully!",
                    data: {
                        email: emailadd,
                        name: name,
                        category: category,
                        location: location
                    }
                });
            } else {
                console.error("Provider profile save error:", err.message);
                resp.status(500).json({ 
                    success: false, 
                    message: "Error saving profile: " + err.message 
                });
            }
        });
    } catch (error) {
        console.error("Provider profile save exception:", error);
        resp.status(500).json({ 
            success: false, 
            message: "Server error: " + error.message 
        });
    }
})
//---------------------------------------
app.post("/Edit-Profile", async function (req, resp) {
    try {
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

        // Handle file upload if new file is provided
        if (req.files && req.files.txtpicPro && req.files.txtpicPro.name) {
            filename = req.files.txtpicPro.name;
            let path = process.cwd() + "/public/uploads/" + filename;
            req.files.txtpicPro.mv(path);//to store pic in uploads folder 
            await cloudinary.uploader.upload(path)
            .then(result=>{
                filename = result.url;
            })
            .catch(err=>{
                console.error("Cloudinary upload error:", err);
                filename = 'uploads/' + req.files.txtpicPro.name; // fallback to local path
            });
            req.body.txtpicPro = filename;
            
            // Update with new photo
            mysql.query("update provider set Fname=?,contact=?,gender=?,category=?,firm=?,website=?,location=?,since=?,profpic=?,otherinfo=? where email=?", [name, Contact, Gender, Category, Firm, Website, Location, Since, filename, Otherinfo, EMAIL], function (err) {
                if (err == null) {
                    resp.json({ 
                        success: true, 
                        message: "Profile updated successfully!",
                        data: {
                            email: EMAIL,
                            name: name,
                            category: Category,
                            location: Location
                        }
                    });
                } else {
                    console.error("Provider profile update error:", err.message);
                    resp.status(500).json({ 
                        success: false, 
                        message: "Error updating profile: " + err.message 
                    });
                }
            });
        } else {
            // Update without changing photo
            mysql.query("update provider set Fname=?,contact=?,gender=?,category=?,firm=?,website=?,location=?,since=?,otherinfo=? where email=?", [name, Contact, Gender, Category, Firm, Website, Location, Since, Otherinfo, EMAIL], function (err) {
                if (err == null) {
                    resp.json({ 
                        success: true, 
                        message: "Profile updated successfully!",
                        data: {
                            email: EMAIL,
                            name: name,
                            category: Category,
                            location: Location
                        }
                    });
                } else {
                    console.error("Provider profile update error:", err.message);
                    resp.status(500).json({ 
                        success: false, 
                        message: "Error updating profile: " + err.message 
                    });
                }
            });
        }
    } catch (error) {
        console.error("Provider profile update exception:", error);
        resp.status(500).json({ 
            success: false, 
            message: "Server error: " + error.message 
        });
    }
})
//------------------------------
app.get("/fetch-providerprofile", function (req, resp) {
    const email = req.query.KuchEmail;
    
    if (!email) {
        resp.status(400).send({ error: "Email parameter is required" });
        return;
    }
    
    console.log("Searching for provider profile with email:", email);
    
    mysql.query("select * from provider where email=?", [email], function (err, resultJsonArray) {
        if (err) {
            console.error("Database error in fetch-providerprofile:", err.message);
            resp.status(500).send({ error: "Database error: " + err.message });
            return;
        }
        
        console.log("Provider query result:", resultJsonArray.length, "records found");
        
        if (resultJsonArray.length === 0) {
            resp.status(404).send({ error: "Provider profile not found for email: " + email });
            return;
        }
        
        resp.send(resultJsonArray);
    })
})

// Test endpoint for specific provider
app.get("/test-provider", function (req, resp) {
    const testEmail = "robert.mechanic@gmail.com";
    
    mysql.query("SELECT * FROM provider WHERE email = ?", [testEmail], function (err, result) {
        if (err) {
            resp.json({ 
                error: err.message,
                email: testEmail,
                timestamp: new Date()
            });
        } else {
            resp.json({ 
                found: result.length > 0,
                count: result.length,
                email: testEmail,
                data: result,
                timestamp: new Date()
            });
        }
    });
});

// Test page for provider search
app.get("/test-provider-search", function (req, resp) {
    let filePath = process.cwd() + "/test-provider-search.html";
    resp.sendFile(filePath);
});

// Test page for login and provider profile workflow
app.get("/test-login-provider", function (req, resp) {
    let filePath = process.cwd() + "/test-login-provider.html";
    resp.sendFile(filePath);
});

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

app.get("/all-providersdash-improved.html", function (req, resp) {
    console.log("📊 Improved providers dashboard requested");
    let filePath3 = process.cwd() + "/all-providersdash.html";
    resp.sendFile(filePath3);
})

app.get("/all-providersdash-improved", function (req, resp) {
    console.log("📊 Improved providers dashboard requested (clean URL)");
    let filePath3 = process.cwd() + "/all-providersdash.html";
    resp.sendFile(filePath3);
})

// Additional routes for provider dashboards
app.get("/providers-dashboard", function (req, resp) {
    console.log("📊 Providers dashboard requested");
    let filePath3 = process.cwd() + "/all-providersdash.html";
    resp.sendFile(filePath3);
})

app.get("/view-providers", function (req, resp) {
    console.log("📊 View providers requested");
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

// Add endpoint to create demo provider for testing
app.get("/create-demo-provider", function (req, resp) {
    const demoProvider = [
        'demo@provider.com', 
        'Demo Provider', 
        '9999999999', 
        'Male', 
        'General Services', 
        'Demo Services Ltd', 
        'www.demoservices.com', 
        'Demo City', 
        '2020', 
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 
        'This is a demo provider account for testing purposes'
    ];

    // First check if demo provider already exists
    mysql.query("SELECT * FROM provider WHERE email = ?", ['demo@provider.com'], function (err, result) {
        if (err) {
            resp.json({ error: err.message });
            return;
        }
        
        if (result.length > 0) {
            resp.json({ 
                success: true, 
                message: "Demo provider already exists",
                provider: result[0]
            });
            return;
        }
        
        // Create demo provider
        mysql.query("INSERT INTO provider VALUES (?,?,?,?,?,?,?,?,?,?,?)", demoProvider, function (err) {
            if (err) {
                resp.json({ error: err.message });
            } else {
                resp.json({ 
                    success: true, 
                    message: "Demo provider created successfully",
                    email: 'demo@provider.com'
                });
            }
        });
    });
})

// Add endpoint to create the specific robert.mechanic provider for testing
app.get("/create-robert-provider", function (req, resp) {
    const robertProvider = [
        'robert.mechanic@gmail.com', 
        'Robert Taylor', 
        '9876543216', 
        'Male', 
        'Automobile', 
        'Taylor Auto Repair', 
        '', 
        'Kolkata', 
        '2015', 
        'https://images.unsplash.com/photo-1507038732509-8b1a3cd5a71c?w=400', 
        'Car and bike repair services'
    ];

    // First check if robert provider already exists
    mysql.query("SELECT * FROM provider WHERE email = ?", ['robert.mechanic@gmail.com'], function (err, result) {
        if (err) {
            resp.json({ error: err.message });
            return;
        }
        
        if (result.length > 0) {
            resp.json({ 
                success: true, 
                message: "Robert provider already exists",
                provider: result[0]
            });
            return;
        }
        
        // Create robert provider
        mysql.query("INSERT INTO provider VALUES (?,?,?,?,?,?,?,?,?,?,?)", robertProvider, function (err) {
            if (err) {
                resp.json({ error: err.message });
            } else {
                resp.json({ 
                    success: true, 
                    message: "Robert provider created successfully",
                    email: 'robert.mechanic@gmail.com'
                });
            }
        });
    });
})

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