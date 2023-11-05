const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

//const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour name must have less or equal than 40 characters'],
        minLength: [10, 'A tour name must have more or 10 characters'],
//        validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug : String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty ist either: easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: (val) => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(value) {
                // This only points to the current doc on NEW document creating. It does not work with update.
                return value < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description'],
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false,
    },
    startLocation: {
      // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
            },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number, 
        }
    ],
    guides: [
      {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
      }
    ],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create Indexes for quick query the fields 
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual Property
tourSchema.virtual('durationWeeks').get(function() {
   return this.duration / 7; 
});

// Virtual Populate -> reviews
tourSchema.virtual('reviews', {
   ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// Document Middleware => "pre" runs before an event occurs (.save() or .create()).
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});

//// Embeeding "Guides" into our Tour model.
//tourSchema.pre('save', async function(next){
//    this.guides = await User.find({ _id: {$in: this.guides } });
//    next();
//});

// Query Middelware => "pre" runs before any given query occurs.
tourSchema.pre(/^find/, function(next){
//tourSchema.pre('find', function(next){
        
    this.find({secretTour: { $ne: true } });
    
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next(); 
});

tourSchema.post(/^find/, function(docs,next){
    console.log(`This Query tooks ${ Date.now() - this.start } miliseconds`);
    
    next();
});


// Aggregation Middleware
//tourSchema.pre('aggregate', function(next){
//    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//    next();
//});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;