db.createUser(
    {
        user: "hastic",
        pwd: "password",
        roles: [
            {
                role: "readWrite",
                db: "hastic"
            }
        ]
    }
);
