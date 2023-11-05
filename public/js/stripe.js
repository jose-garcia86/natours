import axios from 'axios';
import { showAlert } from './alerts';


export const bookTour = async tourId => {
    const stripe = Stripe('pk_test_51O72krFWtwAuiNa5NP8HfJLVlAD7Tru4DU20rqgi53prFcQe6MOJLN9SqtptrcSs2fldqDmkt8KsjqiOGBQBq6xu00jILqyJdu');

    try {
        // 1. Get Checkout session from API
        const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
        console.log(session);
        // 2. Create the Checkout form + charge Credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }


};