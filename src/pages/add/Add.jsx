import React from "react";
import "./Add.scss";

const Add = () => {
  return (
    <div className="add">
      <div className="container">
        <h1>Add New Service</h1>
        <div className="sections">
          <div className="info">
            <label htmlFor="">Title</label>
            <input
              type="text"
              placeholder="e.g. I will do something I'm really good at"
            />

            {/* Handicraft Artwork
Textile Creation
Home Decor
Jewelry & Accessories
Wellness & Beauty
Traditional Instruments
Ceremonial Arts
Educational Services */}


            <label htmlFor="">Category</label>
            <select name="cats" id="cats">
              <option value="design">Handicraft Artwork</option>
              <option value="web">Textile Creation</option>
              <option value="animation">Home Decor</option>
              <option value="music">Wellness & Beauty</option>
              <option value="web">Traditional Instruments</option>
              <option value="animation">Ceremonial Arts</option>
              <option value="music">Educational Services</option>

            </select>
            <label htmlFor="">Cover Image</label>
            <input type="file" />
            <label htmlFor="">Upload Images</label>
            <input type="file" multiple />
            <label htmlFor="">Description</label>
            <textarea name="" id="" placeholder="Brief descriptions to introduce your service to customers" cols="0" rows="16"></textarea>
            <button>Create</button>
          </div>
          <div className="details">
            <label htmlFor="">Service Title</label>
            <input type="text" placeholder="e.g. Handloom sarees" />
            <label htmlFor="">Short Description</label>
            <textarea name="" id="" placeholder="Short description of your service" cols="30" rows="10"></textarea>
            <label htmlFor="">Delivery Time (e.g. 3 days)</label>
            <input type="number" />
            <label htmlFor="">Revision Number</label>
            <input type="number" />
            <label htmlFor="">Add Features</label>
            <input type="text" placeholder="e.g. customized colours" />
            <input type="text" placeholder="e.g. customized designs and patterns" />
            <input type="text" placeholder="e.g. saree jacket" />
            <label htmlFor="">Price</label>
            <input type="number" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;
