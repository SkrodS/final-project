module.exports = (app, cookie, bcrypt) => {

    //POST FOR ADDING ITEMS TO SHOPPING bag
    app.post("/product/:id/add-item", (req, res) => {
        Product.findOne({"_id": req.params.id}, [], async (err, product) => {
            if (product) {
                if (req.cookies.bagItems) {
                    let bagItems = [req.cookies.bagItems];
                    bagItems.push({ name: product.name,
                                    size: req.body.size,
                                    quantity: parseInt(req.body.quantity),
                                    price: parseInt(req.body.price),
                                    image: req.body.image });
                    
                    bagItems = bagItems.reduce((acc, val) => acc.concat(val), []);

                    if (Array.isArray(bagItems)) {
                        bagItems = Array.from(bagItems.reduce((acc, { quantity, ...r }) => {
                            const key = JSON.stringify(r);
                            const current = acc.get(key) || { ...r, quantity: 0 };
                            return acc.set(key, { ...current, quantity: current.quantity + quantity });
                        }, new Map).values());
                    };
                    
                    await res.cookie("bagItems", bagItems, { maxAge: 10800000 });
                }
                else {
                    await res.cookie("bagItems", { "name": product.name, 
                                                    "size": req.body.size,
                                                    "quantity": parseInt(req.body.quantity),
                                                    "price": parseInt(req.body.price),
                                                    "image": req.body.image }, 
                                                    { maxAge: 10800000 });
                };
                res.redirect("/shopping-bag");
            }
            else {
                res.send(err);
            };
        });
    });

    //UPDATE BAG ROUTE
    app.post("/update-bag", async (req, res) => {
        let bag = req.cookies.bagItems;
        let deleted = JSON.parse(req.body.deleted)

        if (Array.isArray(bag) && bag.length > 1) {
            bag.forEach((element, i) => {
                if (deleted.name == element.name && deleted.size == element.size) {
                    bag.splice(i, 1);
                };
            });

            if (!bag.length) {
                await res.clearCookie("bagItems");
            }
            else {
                await res.cookie("bagItems", bag, { maxAge: 10800000 });
            };
        }
        else {
            await res.clearCookie("bagItems");
        }
        res.redirect("/shopping-bag");
    });

    //CREATE RODER ROUTE
    app.post("/create-order", async (req, res) => {
        await Order.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            address: req.body.address,
            country: req.body.country,
            city: req.body.city,
            zipCode: req.body.zip,
            bagItems: JSON.parse(req.body.bagItems),
        })
        await res.cookie("orderComplete", true, { maxAge: 600000 });
        await res.clearCookie("bagItems");
        res.redirect("/order-complete");
    });
};