const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const User = require('./models/User');
const Schedule = require('./models/Schedule');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/railbus').then(() => console.log('MongoDB Connected to railbus'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'railbus-secret-key-12345',
    resave: false,
    saveUninitialized: false
}));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Inject User to all views if logged in
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? { _id: req.session.userId, username: req.session.username, role: req.session.role, companyName: req.session.companyName } : null;
    next();
});

// Dynamic Data Seeding
const cities = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow", "Goa"];
async function seedRandomSchedules() {
    const existing = await Schedule.countDocuments();
    
    // Always ensure we have some guaranteed dummy data regardless of random generation
    const fixedRoutes = [
        { from: "Delhi", to: "Mumbai", type: "rail" },
        { from: "Delhi", to: "Mumbai", type: "bus" },
        { from: "Bangalore", to: "Chennai", type: "rail" },
        { from: "Hyderabad", to: "Pune", type: "bus" }
    ];

    for (let route of fixedRoutes) {
        const routeExists = await Schedule.findOne({ from: route.from, to: route.to, type: route.type });
        if (!routeExists) {
            const departure = new Date();
            departure.setHours(departure.getHours() + 10);
            const arrival = new Date(departure.getTime() + 12 * 3600000);
            await Schedule.create({
                type: route.type,
                from: route.from,
                to: route.to,
                departure,
                arrival,
                price: route.type === 'rail' ? 1200 : 700,
                totalSeats: route.type === 'rail' ? 500 : 40,
                availableSeats: route.type === 'rail' ? 450 : 35
            });
        }
    }

    if (existing > 10) return; // Only seed random if mostly empty

    for (let i = 0; i < 20; i++) {
        const from = cities[Math.floor(Math.random() * cities.length)];
        let to = cities[Math.floor(Math.random() * cities.length)];
        while (from === to) to = cities[Math.floor(Math.random() * cities.length)];

        const type = Math.random() > 0.5 ? 'rail' : 'bus';
        const departure = new Date();
        departure.setHours(departure.getHours() + Math.floor(Math.random() * 24));
        const arrival = new Date(departure.getTime() + (Math.random() * 12 + 2) * 3600000);

        await Schedule.create({
            type,
            from,
            to,
            departure,
            arrival,
            price: type === 'rail' ? Math.floor(Math.random() * 1500 + 500) : Math.floor(Math.random() * 800 + 300),
            totalSeats: type === 'rail' ? 500 : 40,
            availableSeats: type === 'rail' ? 450 : 35
        });
    }
    console.log("Seeded 20 random Rail/Bus schedules along with guaranteed data.");
}
seedRandomSchedules();

// Routes
app.get('/', async (req, res) => {
    res.render('index', { schedules: null });
});

app.get('/search', async (req, res) => {
    const { from, to, type } = req.query;
    const query = { type };
    if (from) query.from = new RegExp(from, 'i');
    if (to) query.to = new RegExp(to, 'i');
    
    const schedules = await Schedule.find(query).sort({ departure: 1 });
    res.render('index', { schedules });
});

app.get('/signup', (req, res) => res.render('signup'));
app.post('/signup', async (req, res) => {
    try {
        const { username, password, role, companyName } = req.body;
        const user = new User({ username, password, role, companyName });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.send("Error creating user: " + err.message);
    }
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await user.comparePassword(password)) {
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.role = user.role;
        req.session.companyName = user.companyName;
        res.redirect('/dashboard');
    } else {
        res.send("Invalid login");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await User.findById(req.session.userId);
    
    let context = { user };
    if (user.role === 'customer') {
        context.bookings = await Booking.find({ userId: user._id }).populate('scheduleId');
    } else if (user.role === 'infrastructure_manager') {
        context.mySchedules = await Schedule.find({ infraManager: user._id });
    } else if (user.role === 'employee') {
        context.allBookings = await Booking.find().populate('userId').populate('scheduleId');
    }
    res.render('dashboard', context);
});

app.post('/book', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const { scheduleId } = req.body;
    const schedule = await Schedule.findById(scheduleId);
    if (schedule && schedule.availableSeats > 0) {
        const seatNum = schedule.totalSeats - schedule.availableSeats + 1;
        await Booking.create({
            userId: req.session.userId,
            scheduleId,
            seatNumber: seatNum
        });
        schedule.availableSeats -= 1;
        await schedule.save();
        res.redirect('/dashboard');
    } else {
        res.send("No seats available or schedule deleted.");
    }
});

app.post('/cancel-booking', async (req, res) => {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (booking && booking.userId.toString() === req.session.userId) {
        booking.status = 'cancelled';
        await booking.save();
        const schedule = await Schedule.findById(booking.scheduleId);
        if (schedule) {
            schedule.availableSeats += 1;
            await schedule.save();
        }
        res.redirect('/dashboard');
    } else {
        res.send("Not authorized");
    }
});

app.post('/add-schedule', async (req, res) => {
    if (req.session.role !== 'infrastructure_manager') return res.send("Forbidden");
    const { type, from, to, departure, arrival, price, totalSeats } = req.body;
    await Schedule.create({
        type, from, to, departure, arrival, price, totalSeats, 
        availableSeats: totalSeats, 
        infraManager: req.session.userId 
    });
    res.redirect('/dashboard');
});

// Real-time randomizer: Every 30 seconds update some schedules to "departed" and add new ones
setInterval(async () => {
    const now = new Date();
    // Delete schedules that arrived more than 1 hour ago
    await Schedule.deleteMany({ arrival: { $lt: new Date(now.getTime() - 3600000) } });
    
    // Create one new random schedule every interval to keep it dynamic
    const from = cities[Math.floor(Math.random() * cities.length)];
    let to = cities[Math.floor(Math.random() * cities.length)];
    while (from === to) to = cities[Math.floor(Math.random() * cities.length)];
    const type = Math.random() > 0.5 ? 'rail' : 'bus';
    const departure = new Date();
    departure.setHours(departure.getHours() + Math.random() * 12);
    const arrival = new Date(departure.getTime() + (Math.random() * 8 + 2) * 3600000);
    
    await Schedule.create({
        type, from, to, departure, arrival,
        price: type === 'rail' ? Math.floor(Math.random() * 1500 + 500) : Math.floor(Math.random() * 800 + 300),
        totalSeats: type === 'rail' ? 500 : 40,
        availableSeats: type === 'rail' ? 450 : 35
    });
    // console.log("Real-time Update: Added new dynamic schedule.");
}, 60000);

app.listen(PORT, () => {
    console.log(`RailBus Server running on http://localhost:${PORT}`);
});
