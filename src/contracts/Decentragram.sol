// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.15;

contract Decentragram {
  string public name = "Decentragram";

  //Store Images
  uint public imageCount = 0;
  mapping(uint => Image) public images;

  struct Image {
    uint id;
    string name;
    string description;
    uint tipAmount;
    address payable author;
  }

  event ImageCreated(
    uint id,
    string name,
    string description,
    uint tipAmount,
    address payable author
  );

  event ImageTipped(
    uint id,
    string name,
    string description,
    uint tipAmount,
    address payable author
  );

  // Create Images
  function uploadImage(string memory _imgHash, string memory _description) public {

    //Make sure the image hash exists
    require(bytes(_imgHash).length > 0);

    //Make sure image description exists
    require(bytes(_description).length > 0);

    /*Make sure uploader address exists
    Alert*/
    require(msg.sender != address(0x0));

    // Increment image id
    imageCount ++;

    // Add Image to contract
    images[1] = Image(imageCount, _imgHash, _description, 0, payable(msg.sender));

    //Trigger an event
    emit ImageCreated(imageCount, _imgHash, _description, 0, payable(msg.sender));
  }

  function tipImageOwner(uint _id) public payable {

    //Make sure the id is valid
    require(_id > 0 && _id <= imageCount);

    //Fetch the image
    Image memory _image = images[_id];

    //Fetch the author
    address payable _author = _image.author;

    //pay the author by sending them Ether
    payable(_author).transfer(msg.value);

    //Increment the tip amount
    _image.tipAmount = _image.tipAmount + msg.value;

    //Update the image
    images[_id] = _image;

    //trigger an event
    emit ImageTipped(_id, _image.name, _image.description, _image.tipAmount, _author);
  }
}

