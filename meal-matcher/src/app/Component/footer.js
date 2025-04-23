
import React from "react";

const Footer = () =>{

    return(
    <div className="bg-gray-800 h-75">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-90 pt-25 text-center">
          <div className=" text-[#008B84] text-left">
            <div className="text-white pb-5 font-extrabold">
              {" "}
              About the company
            </div>
            <p className="text-lg">
              You found our footer !, nothing much here, just make sure to make
              an account and start matching!
            </p>
          </div>
          <div className="text-[#008B84]  text-left">
            <div className="text-white text-lg pb-5 font-extrabold">
              Contact Us
            </div>
            <div className="text-lg">
              <div>📍 Blacksburg, VA</div>
              <div>📞 856-089-1234</div>
              <div>📧 support@mealmatcher.com</div>
            </div>
          </div>
        </div>
      </div>
      );
}

export default Footer;