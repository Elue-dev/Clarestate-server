export interface PropertyTypes {
  _id: Object;
  name: String;
  price: Number;
  location: String;
  images: [String] | [];
  features: [String];
  availability: String;
  ratingsAverage: Number;
  ratingsQuantity: Number;
  purpose: String;
  description: String;
  bedrooms: Number;
  bathrooms: Number;
  toilets: Number;
  agentName: String;
  agentContact: String;
  addedBy: {
    _id: Object;
    photo: String;
    first_name: String;
    last_name: String;
  };
  createdAt: Date;
  updatedAt: Date;
  slug: String;
  __v: Number;
  id: String;
}
