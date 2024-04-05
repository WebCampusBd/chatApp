// external imports
const createError = require("http-errors");
// internal imports
const User = require("../models/People");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const escape = require("../utilities/escape");
const { Socket } = require("socket.io");

// get inbox page
async function getInbox(req, res, next) {
  try {
    const conversations = await Conversation.find({
      $or: [
        {
          "creator.id": req.user.id,
        },
        {
          "participant.id": req.user.id,
        },
      ],
    });
    res.locals.data = conversations;
    res.render("inbox");
  } catch (error) {
    next(error.message);
  }
}

// search user
const searchUser = async (req, res, next) => {
  try {
    const user = req.body.user;
    const searchQuery = user.replace("+88", "");

    const name_search_regex = new RegExp(escape(searchQuery), "i");
    const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
    const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");
    if (user !== "") {
      const users = await User.find({
        $or: [
          {
            name: name_search_regex,
          },
          {
            email: mobile_search_regex,
          },
          {
            mobile: email_search_regex,
          },
        ],
      });
      res.json(users);
    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (error) {
    res.status(500).json({
      errors: {
        common: {
          msg: error.message,
        },
      },
    });
  }
};

// add conversation
const addConversation = async (req, res, next) => {
  try {
    const newConversation = new Conversation({
      creator: {
        id: req.user.id,
        name: req.user.username,
        avatar: req.user.avatar || null,
      },
      participant: {
        id: req.body.participant_id,
        name: req.body.participant_name,
        avatar: req.body.participant_avatar || null,
      },
    });
    const result = await newConversation.save();
    res.status(200).json({
      message: "Conversation was added successfully!",
    });
  } catch (error) {
    res.status(500).json({
      errors: {
        common: {
          msg: error.message,
        },
      },
    });
  }
};

// get messages
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find(req.params).sort("-createdAt");
    const { participant } = await Conversation.findOne({
      _id: req.params.conversation_id,
    });
    res.status(200).json({
      data: {
        messages,
        participant,
      },
    });
  } catch (error) {
    res.status(500).json({
      errors: {
        common: {
          msg: error.message,
        },
      },
    });
  }
};

// send Message
const sendMessage = async (req, res) => {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      const {
        message,
        receiver_id,
        receiver_name,
        receiver_avatar,
        conversation_id,
      } = req.body;

      let attachments = null;
      if (req.files && req.files.length > 0) {
        attachments = [];
        req.files.forEach((file) => {
          attachments.push(file.filename);
        });
      }
      const newMessage = new Message({
        text: message,
        attachment: attachments,
        sender: {
          id: req.user.id,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        receiver: {
          id: receiver_id,
          name: receiver_name,
          avatar: receiver_avatar || null,
        },
        conversation_id,
      });
      const result = await newMessage.save();

      // socket event
      global.io.emit("new_message", {
        message: {
          conversation_id,
          text: message,
          attachment: attachments,

          date_time: result.date_time,
          sender: {
            id: req.user.id,
            name: req.user.username,
            avatar: req.user.avatar | null,
          },
        },
      });

      res.status(200).json({
        message: "succesfull!",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        errors: {
          common: {
            msg: error.message,
          },
        },
      });
    }
  } else {
    res.status(500).json({
      errors: {
        common: "Message text or Attachment is required!",
      },
    });
  }
};

module.exports = {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  sendMessage,
};
