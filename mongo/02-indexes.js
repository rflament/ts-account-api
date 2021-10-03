
// switch to accounts db
db = db.getSiblingDB('accounts')

// create asc and desc indexes for columns that can be sorted
db.accounts.createIndex({ createdDate: -1, });
db.accounts.createIndex({ createdDate: 1, });
db.accounts.createIndex({ amt: -1, });
db.accounts.createIndex({ amt: 1, });

// create text index for name search

db.accounts.createIndex(
    {
        firstName: "text",
        lastName: "text"
    }
);

// asc index enough for country and mfa
db.accounts.createIndex({ country: 1, });
db.accounts.createIndex({ mfa: 1, });