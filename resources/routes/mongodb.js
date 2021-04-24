module.exports = (app, mon, bcrypt) => {
    mon.connect(process.env.DBPATH, { useNewUrlParser: true, useUnifiedTopology: true });

    const productSchema = new mon.Schema({
        name: String,
        description: String,
        image: String,
        popular: Boolean,
    });

    Product = mon.model("Product", productSchema);

    const adminSchema = new mon.Schema({
        username: String,
        password: String,
        adminKey: String,
    });

    Admin = mon.model("Admin", adminSchema);


    const orderSchema = new mon.Schema({
        firstname: String,
        lastname: String,
        address: String,
        zipCode: Number,
        city: String,
        cartItems: Object,
    });

    Order = mon.model("Order", orderSchema);
};