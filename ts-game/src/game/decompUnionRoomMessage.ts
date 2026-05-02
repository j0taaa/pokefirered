// Ported from src/union_room_message.c. Text control escapes such as \p and \l are preserved verbatim.

export const GENDER_MALE = 0;
export const GENDER_FEMALE = 1;
export const GENDER_COUNT = 2;

export const RFU_STATUS_OK = 0;
export const RFU_STATUS_FATAL_ERROR = 1;
export const RFU_STATUS_CONNECTION_ERROR = 2;
export const RFU_STATUS_CHILD_SEND_COMPLETE = 3;
export const RFU_STATUS_NEW_CHILD_DETECTED = 4;
export const RFU_STATUS_JOIN_GROUP_OK = 5;
export const RFU_STATUS_JOIN_GROUP_NO = 6;
export const RFU_STATUS_WAIT_ACK_JOIN_GROUP = 7;
export const RFU_STATUS_LEAVE_GROUP_NOTICE = 8;
export const RFU_STATUS_LEAVE_GROUP = 9;
export const LINK_GROUP_SINGLE_BATTLE = 0;
export const LINK_GROUP_DOUBLE_BATTLE = 1;
export const LINK_GROUP_MULTI_BATTLE = 2;
export const LINK_GROUP_TRADE = 3;
export const LINK_GROUP_POKEMON_JUMP = 4;
export const LINK_GROUP_BERRY_CRUSH = 5;
export const LINK_GROUP_BERRY_PICKING = 6;
export const LINK_GROUP_WONDER_CARD = 7;
export const LINK_GROUP_WONDER_NEWS = 8;
export const CLI_RECV = 2;
export const CLI_COPY_MSG = 12;
export const CLI_SEND_READY_END = 20;
export const CLI_RETURN = 1;
export const CLI_MSG_BUFFER_FAILURE = 14;
export const SVR_LOAD_CLIENT_SCRIPT = 18;
export const SVR_SEND = 1;
export const SVR_LOAD_MSG = 20;
export const SVR_RECV = 2;
export const SVR_RETURN = 0;
export const SVR_MSG_CLIENT_CANCELED = 9;
export const MG_LINKID_DYNAMIC_MSG = 21;
export const MG_LINKID_READY_END = 20;

const designatedArray = <T>(entries: Array<[number, T]>): Array<T | null> => {
  const out: Array<T | null> = [];
  for (const [index, value] of entries) out[index] = value;
  return out;
};

export const gText_UR_EmptyString = "";
export const gText_UR_Colon = ":";
export const gText_UR_ID = "{ID}";
export const gText_UR_PleaseStartOver = "Please start over from the beginning.";
export const gText_UR_WirelessSearchCanceled = "The WIRELESS COMMUNICATION\nSYSTEM search has been canceled.";
export const sText_AwaitingCommunucation2 = "ともだちからの れんらくを\nまっています";
export const gText_UR_AwaitingCommunication = "{STR_VAR_1}! Awaiting\ncommunication from another player.";
export const gText_UR_AwaitingLinkPressStart = "{STR_VAR_1}! Awaiting link!\nPress START when everyone's ready.";
export const sText_SingleBattle = "シングルバトルを かいさいする";
export const sText_DoubleBattle = "ダブルバトルを かいさいする";
export const sText_MultiBattle = "マルチバトルを かいさいする";
export const sText_TradePokemon = "ポケモンこうかんを かいさいする";
export const sText_Chat = "チャットを かいさいする";
export const sText_DistWonderCard = "ふしぎなカードをくばる";
export const sText_DistWonderNews = "ふしぎなニュースをくばる";
export const sText_DistMysteryEvent = "ふしぎなできごとを かいさいする";
export const sText_HoldPokemonJump = "なわとびを かいさいする";
export const sText_HoldBerryCrush = "きのみマッシャーを かいさいする";
export const sText_HoldBerryPicking = "きのみどりを かいさいする";
export const sText_HoldSpinTrade = "ぐるぐるこうかんを かいさいする";
export const sText_HoldSpinShop = "ぐるぐるショップを かいさいする";
export const sText_1PlayerNeeded = "1 player\nneeded.";
export const sText_2PlayersNeeded = "2 players\nneeded.";
export const sText_3PlayersNeeded = "3 players\nneeded.";
export const sText_4PlayersNeeded = "あと4にん\nひつよう";
export const sText_2PlayerMode = "2-PLAYER\nMODE";
export const sText_3PlayerMode = "3-PLAYER\nMODE";
export const sText_4PlayerMode = "4-PLAYER\nMODE";
export const sText_5PlayerMode = "5-PLAYER\nMODE";
export const gText_UR_BButtonCancel = "{B_BUTTON}CANCEL";
export const sText_SearchingForParticipants = "ため\nさんかしゃ ぼしゅうちゅう です！";
export const gText_UR_PlayerContactedYouForXAccept = "{STR_VAR_2} contacted you for\n{STR_VAR_1}. Accept?";
export const gText_UR_PlayerContactedYouShareX = "{STR_VAR_2} contacted you.\nWill you share {STR_VAR_1}?";
export const gText_UR_PlayerContactedYouAddToMembers = "{STR_VAR_2} contacted you.\nAdd to the members?";
export const gText_UR_AreTheseMembersOK = "{STR_VAR_1}!\nAre these members OK?";
export const gText_UR_CancelModeWithTheseMembers = "Cancel {STR_VAR_1} MODE\nwith these members?";
export const gText_UR_AnOKWasSentToPlayer = "An “OK” was sent\nto {STR_VAR_1}.";
export const sText_OtherTrainerUnavailableNow = "The other TRAINER doesn't appear\nto be available now…\\p";
export const sText_CantTransmitTrainerTooFar = "You can't transmit with a TRAINER\nwho is too far away.\\p";
export const sText_TrainersNotReadyYet = "The other TRAINER(S) is/are not\nready yet.\\p";
export const gText_UR_ModeWithTheseMembersWillBeCanceled = "The {STR_VAR_1} MODE with\nthese members will be canceled.{PAUSE 90}";
export const sText_MemberNoLongerAvailable = "There is a member who can no\nlonger remain available.\\p";
export const sText_TrainerAppearsUnavailable = "The other TRAINER appears\nunavailable…\\p";
export const gText_UR_PlayerSentBackOK = "{STR_VAR_1} sent back an “OK”!";
export const gText_UR_PlayerOKdRegistration = "{STR_VAR_1} OK'd your registration as\na member.";
export const sText_PlayerRepliedNo = "{STR_VAR_1} replied, “No…”\\p";
export const gText_UR_AwaitingOtherMembers = "{STR_VAR_1}!\nAwaiting other members!";
export const gText_UR_QuitBeingMember = "Quit being a member?";
export const sText_StoppedBeingMember = "You stopped being a member.\\p";
export const gText_UR_WirelessLinkEstablished = "The WIRELESS COMMUNICATION\nSYSTEM link has been established.";
export const gText_UR_WirelessLinkDropped = "The WIRELESS COMMUNICATION\nSYSTEM link has been dropped…";
export const gText_UR_LinkWithFriendDropped = "The link with your friend has been\ndropped…";
export const sText_PlayerRepliedNo2 = "{STR_VAR_1} replied, “No…”";
export const sText_DoYouWantXMode = "Do you want the {STR_VAR_2}\nMODE?";
export const sText_DoYouWantXMode2 = "Do you want the {STR_VAR_2}\nMODE?";
export const sText_CommunicatingPleaseWait = "はなしかけています…\nしょうしょう おまちください";
export const gText_UR_AwaitingPlayersResponseAboutTrade = "Awaiting {STR_VAR_1}'s response about\nthe trade…";
export const sText_Communicating = "Communicating{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.\n{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.";
export const sText_CommunicatingWithPlayer = "Communicating with {STR_VAR_1}{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.\n{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.";
export const sText_PleaseWaitAWhile = "Please wait a while{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.\n{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.{PAUSE 15}.";
export const sText_HiDoSomethingMale = "Hiya! Is there something that you\nwanted to do?";
export const sText_HiDoSomethingFemale = "Hello!\nWould you like to do something?";
export const sText_HiDoSomethingAgainMale = "{STR_VAR_1}: Hiya, we meet again!\nWhat are you up for this time?";
export const sText_HiDoSomethingAgainFemale = "{STR_VAR_1}: Oh! {PLAYER}, hello!\nWould you like to do something?";
export const sText_DoSomethingMale = "Want to do something?";
export const sText_DoSomethingFemale = "Would you like to do something?";
export const sText_DoSomethingAgainMale = "{STR_VAR_1}: What would you like to\ndo now?";
export const sText_DoSomethingAgainFemale = "{STR_VAR_1}‘また なにかする？";
export const sText_SomebodyHasContactedYou = "Somebody has contacted you.{PAUSE 60}";
export const sText_PlayerHasContactedYou = "{STR_VAR_1} has contacted you.{PAUSE 60}";
export const sText_AwaitingResponseFromTrainer = "Awaiting a response from\nthe other TRAINER…";
export const sText_AwaitingResponseFromPlayer = "Awaiting a response from\n{STR_VAR_1}…";
export const sText_AwaitingResponseCancelBButton = "あいての ていあんを まっています\nビーボタンで キャンセル";
export const gText_UR_ShowTrainerCard = "The other TRAINER showed\nyou their TRAINER CARD.\\pWould you like to show your\nTRAINER CARD?";
export const gText_UR_BattleChallenge = "The other TRAINER challenges you\nto battle.\\pWill you accept the battle\nchallenge?";
export const gText_UR_ChatInvitation = "The other TRAINER invites you\nto chat.\\pWill you accept the chat\ninvitation?";
export const gText_UR_OfferToTradeMon = "There is an offer to trade your\nregistered Lv. {DYNAMIC 0} {DYNAMIC 1}\\pin exchange for a\nLv. {DYNAMIC 2} {DYNAMIC 3}.\\pWill you accept this trade\noffer?";
export const gText_UR_OfferToTradeEgg = "There is an offer to trade your\nregistered EGG.\\lWill you accept this trade offer?";
export const gText_UR_ChatDropped = "The chat has been dropped.\\p";
export const gText_UR_OfferDeclined1 = "You declined the offer.\\p";
export const gText_UR_OfferDeclined2 = "You declined the offer.\\p";
export const gText_UR_ChatEnded = "The chat was ended.\\p";
export const sText_JoinChatMale = "Oh, hey! We're in a chat right now.\nWant to join us?";
export const sText_PlayerJoinChatMale = "{STR_VAR_1}: Hey, {PLAYER}!\nWe're having a chat right now.\\lWant to join us?";
export const sText_JoinChatFemale = "Oh, hi! We're having a chat now.\nWould you like to join us?";
export const sText_PlayerJoinChatFemale = "{STR_VAR_1}: Oh, hi, {PLAYER}!\nWe're having a chat now.\\lWould you like to join us?";
export const gText_UR_TrainerAppearsBusy = "……\nThe TRAINER appears to be busy…\\p";
export const sText_WaitForBattleMale = "A battle, huh?\nAll right, just give me some time.";
export const sText_WaitForChatMale = "You want to chat, huh?\nSure, just wait a little.";
export const sText_ShowTrainerCardMale = "Sure thing! As my “Greetings,”\nhere's my TRAINER CARD.";
export const sText_WaitForBattleFemale = "A battle? Of course, but I need\ntime to get ready.";
export const sText_WaitForChatFemale = "Did you want to chat?\nOkay, but please wait a moment.";
export const sText_ShowTrainerCardFemale = "As my introduction, I'll show you\nmy TRAINER CARD.";
export const sText_WaitForChatMale2 = "チャットだね！\nわかった ちょっと まってて！";
export const sText_DoneWaitingBattleMale = "Thanks for waiting!\nLet's get our battle started!{PAUSE 60}";
export const sText_DoneWaitingChatMale = "All right!\nLet's chat!{PAUSE 60}";
export const sText_DoneWaitingBattleFemale = "Sorry I made you wait!\nLet's get started!{PAUSE 60}";
export const sText_DoneWaitingChatFemale = "Sorry I made you wait!\nLet's chat.{PAUSE 60}";
export const sText_TradeWillBeStarted = "The trade will be started.{PAUSE 60}";
export const sText_BattleWillBeStarted = "The battle will be started.{PAUSE 60}";
export const sText_EnteringChat = "Entering the chat…{PAUSE 60}";
export const sText_BattleDeclinedMale = "Sorry! My POKéMON don't seem to\nbe feeling too well right now.\\lLet me battle you another time.\\p";
export const sText_BattleDeclinedFemale = "I'm terribly sorry, but my POKéMON\naren't feeling well…\\pLet's battle another time.\\p";
export const sText_ShowTrainerCardDeclinedMale = "Huh? My TRAINER CARD…\nWhere'd it go now?\\lSorry! I'll show you another time!\\p";
export const sText_ShowTrainerCardDeclinedFemale = "Oh? Now where did I put my\nTRAINER CARD?…\\lSorry! I'll show you later!\\p";
export const sText_IfYouWantToDoSomethingMale = "If you want to do something with\nme, just give me a shout!\\p";
export const sText_IfYouWantToDoSomethingFemale = "If you want to do something with\nme, don't be shy.\\p";
export const gText_UR_TrainerBattleBusy = "Whoops! Sorry, but I have to do\nsomething else.\\lAnother time, okay?\\p";
export const gText_UR_NeedTwoMonsOfLevel30OrLower1 = "If you want to battle, you need\ntwo POKéMON that are below\\lLv. 30.\\p";
export const gText_UR_NeedTwoMonsOfLevel30OrLower2 = "For a battle, you need two\nPOKéMON that are below Lv. 30.\\p";
export const sText_DeclineChatMale = "Oh, all right.\nCome see me anytime, okay?\\p";
export const stext_DeclineChatFemale = "Oh…\nPlease come by anytime.\\p";
export const sText_ChatDeclinedMale = "Oh, sorry!\nI just can't right this instant.\\lLet's chat another time.\\p";
export const sText_ChatDeclinedFemale = "Oh, I'm sorry.\nI have too much to do right now.\\lLet's chat some other time.\\p";
export const sText_YoureToughMale = "Whoa!\nI can tell you're pretty tough!\\p";
export const sText_UsedGoodMoveMale = "You used that move?\nThat's good strategy!\\p";
export const sText_BattleSurpriseMale = "Way to go!\nThat was an eye-opener!\\p";
export const sText_SwitchedMonsMale = "Oh! How could you use that\nPOKéMON in that situation?\\p";
export const sText_YoureToughFemale = "That POKéMON…\nIt's been raised really well!\\p";
export const sText_UsedGoodMoveFemale = "That's it!\nThis is the right move now!\\p";
export const sText_BattleSurpriseFemale = "That's awesome!\nYou can battle that way?\\p";
export const sText_SwitchedMonsFemale = "You have exquisite timing for\nswitching POKéMON!\\p";
export const sText_LearnedSomethingMale = "Oh, I see!\nThis is educational!\\p";
export const sText_ThatsFunnyMale = "Don't say anything funny anymore!\nI'm sore from laughing!\\p";
export const sText_RandomChatMale1 = "Oh?\nSomething like that happened.\\p";
export const sText_RandomChatMale2 = "Hmhm… What?\nSo is this what you're saying?\\p";
export const sText_LearnedSomethingFemale = "Is that right?\nI didn't know that.\\p";
export const sText_ThatsFunnyFemale = "Ahaha!\nWhat is that about?\\p";
export const sText_RandomChatFemale1 = "Yes, that's exactly it!\nThat's what I meant.\\p";
export const sText_RandomChatFemale2 = "In other words…\nYes! That's right!\\p";
export const sText_ShowedTrainerCardMale1 = "I'm just showing my TRAINER CARD\nas my way of greeting.\\p";
export const sText_ShowedTrainerCardMale2 = "I hope I get to know you better!\\p";
export const sText_ShowedTrainerCardFemale1 = "We're showing each other our\nTRAINER CARDS to get acquainted.\\p";
export const sText_ShowedTrainerCardFemale2 = "Glad to meet you.\nPlease don't be a stranger!\\p";
export const sText_MaleTraded1 = "Yeahah!\nI really wanted this POKéMON!\\p";
export const sText_MaleTraded2 = "Finally, a trade got me that\nPOKéMON I'd wanted a long time.\\p";
export const sText_FemaleTraded1 = "I'm trading POKéMON right now.\\p";
export const sText_FemaleTraded2 = "I finally got that POKéMON I\nwanted in a trade!\\p";
export const gText_UR_XCheckedTradingBoard = "{STR_VAR_1} checked the\nTRADING BOARD.\\p";
export const gText_UR_RegisterMonAtTradingBoard = "Welcome to the TRADING BOARD.\\pYou may register your POKéMON\nand offer it up for a trade.\\pWould you like to register one of\nyour POKéMON?";
export const gText_UR_TradingBoardInfo = "This TRADING BOARD is used for\noffering a POKéMON for a trade.\\pAll you need to do is register a\nPOKéMON for a trade.\\pAnother TRAINER may offer a party\nPOKéMON in return for the trade.\\pWe hope you will register POKéMON\nand trade them with many, many\\lother TRAINERS.\\pWould you like to register one of\nyour POKéMON?";
export const sText_ThankYouForRegistering = "こうかんけいじばん の とうろくが\nかんりょう しました\\pごりよう ありがとう\nございました！\\p";
export const sText_NobodyHasRegistered = "けいじばんに だれも ポケモンを\nとうろく していません\\p\n";
export const gText_UR_ChooseRequestedMonType = "Please choose the type of POKéMON\nthat you would like in the trade.\n";
export const gText_UR_WhichMonWillYouOffer = "Which of your party POKéMON will\nyou offer in trade?\\p";
export const gText_UR_RegistrationCanceled = "Registration has been canceled.\\p";
export const gText_UR_RegistraionCompleted = "Registration has been completed.\\p";
export const gText_UR_TradeCanceled = "The trade has been canceled.\\p";
export const gText_UR_CancelRegistrationOfMon = "Cancel the registration of your\nLv. {STR_VAR_2} {STR_VAR_1}?";
export const gText_UR_CancelRegistrationOfEgg = "Cancel the registration of your\nEGG?";
export const gText_UR_RegistrationCanceled2 = "The registration has been canceled.\\p";
export const sText_TradeTrainersWillBeListed = "こうかんを きぼうしているひとを\nひょうじします";
export const sText_ChooseTrainerToTradeWith2 = "こうかん したい トレーナーを\nえらんで ください";
export const gText_UR_AskTrainerToMakeTrade = "Would you like to ask {STR_VAR_1} to\nmake a trade?";
export const sText_AwaitingResponseFromTrainer2 = "……\nあいての へんじを まっています";
export const sText_NotRegisteredAMonForTrade = "あなたが こうかんにだす\nポケモンが とうろくされていません\\p";
export const gText_UR_DontHaveTypeTrainerWants = "You don't have a {STR_VAR_2}-type\nPOKéMON that {STR_VAR_1} wants.\\p";
export const gText_UR_DontHaveEggTrainerWants = "You don't have an EGG that\n{STR_VAR_1} wants.\\p";
export const sText_PlayerCantTradeForYourMon = "{STR_VAR_1} can't make a trade for\nyour POKéMON right now.\\p";
export const sText_CantTradeForPartnersMon = "You can't make a trade for\n{STR_VAR_1}'s POKéMON right now.\\p";
export const gText_UR_TradeOfferRejected = "Your trade offer was rejected.\\p";
export const gText_UR_EggTrade = "EGG TRADE";
export const gText_UR_ChooseJoinCancel = "{DPAD_UPDOWN}CHOOSE  {A_BUTTON}JOIN  {B_BUTTON}CANCEL";
export const gText_UR_ChooseTrainer = "Please choose a TRAINER.";
export const sText_ChooseTrainerSingleBattle = "Please choose a TRAINER for\na SINGLE BATTLE.";
export const sText_ChooseTrainerDoubleBattle = "Please choose a TRAINER for\na DOUBLE BATTLE.";
export const sText_ChooseLeaderMultiBattle = "Please choose the LEADER\nfor a MULTI BATTLE.";
export const sText_ChooseTrainerToTradeWith = "Please choose the TRAINER to\ntrade with.";
export const sText_ChooseTrainerToShareWonderCards = "Please choose the TRAINER who is\nsharing WONDER CARDS.";
export const sText_ChooseTrainerToShareWonderNews = "Please choose the TRAINER who is\nsharing WONDER NEWS.";
export const sText_ChooseLeaderPokemonJump = "Jump with mini POKéMON!\nPlease choose the LEADER.";
export const sText_ChooseLeaderBerryCrush = "BERRY CRUSH!\nPlease choose the LEADER.";
export const sText_ChooseLeaderBerryPicking = "DODRIO BERRY-PICKING!\nPlease choose the LEADER.";
export const gText_UR_SearchingForWirelessSystemWait = "Searching for a WIRELESS\nCOMMUNICATION SYSTEM. Wait...";
export const sText_MustHaveTwoMonsForDoubleBattle = "ダブルバトルでは 2ひき いじょうの\nポケモンが ひつようです\\p";
export const gText_UR_AwaitingPlayersResponse = "Awaiting {STR_VAR_1}'s response…";
export const gText_UR_PlayerHasBeenAskedToRegisterYouPleaseWait = "{STR_VAR_1} has been asked to register\nyou as a member. Please wait.";
export const gText_UR_AwaitingResponseFromWirelessSystem = "Awaiting a response from the\nWIRELESS COMMUNICATION SYSTEM.";
export const sText_PleaseWaitForOtherTrainersToGather = "ほかの さんかしゃが そろうまで\nしょうしょう おまちください";
export const sText_NoCardsSharedRightNow = "No CARDS appear to be shared \nright now.";
export const sText_NoNewsSharedRightNow = "No NEWS appears to be shared\nright now.";
export const gText_UR_Battle = "BATTLE";
export const gText_UR_Chat2 = "CHAT";
export const gText_UR_Greetings = "GREETINGS";
export const gText_UR_Exit = "EXIT";
export const gText_UR_Exit2 = "EXIT";
export const gText_UR_Info = "INFO";
export const gText_UR_NameWantedOfferLv = "NAME{CLEAR_TO 0x3C}WANTED{CLEAR_TO 0x6E}OFFER{CLEAR_TO 0xC6}LV.";
export const gText_UR_SingleBattle = "SINGLE BATTLE";
export const gText_UR_DoubleBattle = "DOUBLE BATTLE";
export const gText_UR_MultiBattle = "MULTI BATTLE";
export const gText_UR_PokemonTrades = "POKéMON TRADES";
export const gText_UR_Chat = "CHAT";
export const gText_UR_Cards = "CARDS";
export const gText_UR_WonderCards = "WONDER CARDS";
export const gText_UR_WonderNews = "WONDER NEWS";
export const gText_UR_PokemonJump = "POKéMON JUMP";
export const gText_UR_BerryCrush = "BERRY CRUSH";
export const gText_UR_BerryPicking = "BERRY-PICKING";
export const gText_UR_Search = "SEARCH";
export const gText_UR_SpinTrade = "ぐるぐるこうかん";
export const gText_UR_ItemTrade = "アイテムトレード";
export const sText_ItsNormalCard = "It's a NORMAL CARD.";
export const sText_ItsBronzeCard = "It's a BRONZE CARD!";
export const sText_ItsCopperCard = "It's a COPPER CARD!";
export const sText_ItsSilverCard = "It's a SILVER CARD!";
export const sText_ItsGoldCard = "It's a GOLD CARD!";
export const gText_UR_TrainerCardInfoPage1 = "This is {DYNAMIC 0} {DYNAMIC 1}'s\nTRAINER CARD…\\l{DYNAMIC 2}\\pPOKéDEX: {DYNAMIC 3}\nTIME:    {DYNAMIC 4}:{DYNAMIC 5}\\p";
export const gText_UR_TrainerCardInfoPage2 = "BATTLES: {DYNAMIC 0} WINS  {DYNAMIC 2} LOSSES\nTRADES:  {DYNAMIC 3} TIMES\\p“{DYNAMIC 4} {DYNAMIC 5}\n{DYNAMIC 6} {DYNAMIC 7}”\\p";
export const sText_GladToMeetYouMale = "{DYNAMIC 1}: Glad to have met you!{PAUSE 60}";
export const sText_GladToMeetYouFemale = "{DYNAMIC 1}: Glad to meet you!{PAUSE 60}";
export const gText_UR_FinishedCheckingPlayersTrainerCard = "Finished checking {DYNAMIC 1}'s\nTRAINER CARD.{PAUSE 60}";
export const sText_CanceledReadingCard = "Canceled reading the Card.";

export const sLinkGroupActionTexts = [
    sText_SingleBattle,
    sText_DoubleBattle,
    sText_MultiBattle,
    sText_TradePokemon,
    sText_Chat,
    sText_DistWonderCard,
    sText_DistWonderNews,
    sText_DistWonderCard,
    sText_HoldPokemonJump,
    sText_HoldBerryCrush,
    sText_HoldBerryPicking,
    sText_HoldBerryPicking,
    sText_HoldSpinTrade,
    sText_HoldSpinShop
] as const;

export const gTexts_UR_PlayersNeededOrMode = [
    [ 
        sText_1PlayerNeeded,
        sText_2PlayerMode
    ],
    [ 
        sText_3PlayersNeeded,
        sText_2PlayersNeeded,
        sText_1PlayerNeeded,
        sText_4PlayerMode
    ],
    [ 
        sText_1PlayerNeeded,
        sText_2PlayerMode,
        sText_3PlayerMode,
        sText_4PlayerMode,
        sText_5PlayerMode
    ],
    [ 
        sText_2PlayersNeeded,
        sText_1PlayerNeeded,
        sText_3PlayerMode,
        sText_4PlayerMode,
        sText_5PlayerMode
    ]
] as const;

export const gTexts_UR_CantTransmitToTrainer = [
    sText_CantTransmitTrainerTooFar,
    sText_TrainersNotReadyYet
] as const;

export const gTexts_UR_PlayerUnavailable = [
    sText_OtherTrainerUnavailableNow,
    sText_MemberNoLongerAvailable
] as const;

export const gTexts_UR_PlayerDisconnected = designatedArray([
  [RFU_STATUS_OK, null],
  [RFU_STATUS_FATAL_ERROR, sText_MemberNoLongerAvailable],
  [RFU_STATUS_CONNECTION_ERROR, sText_TrainerAppearsUnavailable],
  [RFU_STATUS_CHILD_SEND_COMPLETE, null],
  [RFU_STATUS_NEW_CHILD_DETECTED, null],
  [RFU_STATUS_JOIN_GROUP_OK, null],
  [RFU_STATUS_JOIN_GROUP_NO, sText_PlayerRepliedNo],
  [RFU_STATUS_WAIT_ACK_JOIN_GROUP, null],
  [RFU_STATUS_LEAVE_GROUP_NOTICE, null],
  [RFU_STATUS_LEAVE_GROUP, sText_StoppedBeingMember],
]);

export const gTexts_UR_LinkDropped = designatedArray([
  [RFU_STATUS_OK, null],
  [RFU_STATUS_FATAL_ERROR, gText_UR_LinkWithFriendDropped],
  [RFU_STATUS_CONNECTION_ERROR, gText_UR_LinkWithFriendDropped],
  [RFU_STATUS_CHILD_SEND_COMPLETE, null],
  [RFU_STATUS_NEW_CHILD_DETECTED, null],
  [RFU_STATUS_JOIN_GROUP_OK, null],
  [RFU_STATUS_JOIN_GROUP_NO, sText_PlayerRepliedNo2],
  [RFU_STATUS_WAIT_ACK_JOIN_GROUP, null],
  [RFU_STATUS_LEAVE_GROUP_NOTICE, null],
  [RFU_STATUS_LEAVE_GROUP, null],
]);

export const sDoYouWantModeTexts = [
    sText_DoYouWantXMode,
    sText_DoYouWantXMode2
] as const;

export const gTexts_UR_CommunicatingWait = [
    sText_Communicating,
    sText_CommunicatingWithPlayer,
    sText_PleaseWaitAWhile
] as const;

export const gTexts_UR_HiDoSomething = [
    [
        sText_HiDoSomethingMale,
        sText_HiDoSomethingFemale
    ], [
        sText_HiDoSomethingAgainMale,
        sText_HiDoSomethingAgainFemale
    ]
] as const;

export const sDoSomethingTexts = [
    [
        sText_DoSomethingMale,
        sText_DoSomethingFemale
    ], [
        sText_DoSomethingAgainMale,
        sText_DoSomethingAgainMale 
    ]
] as const;

export const gTexts_UR_PlayerContactedYou = [
    sText_SomebodyHasContactedYou,
    sText_PlayerHasContactedYou
] as const;

export const gTexts_UR_AwaitingResponse = [
    sText_AwaitingResponseFromTrainer,
    sText_AwaitingResponseFromPlayer
] as const;

export const sInvitationTexts = [
    gText_UR_ShowTrainerCard,
    gText_UR_BattleChallenge,
    gText_UR_ChatInvitation,
    gText_UR_OfferToTradeMon
] as const;

export const gTexts_UR_JoinChat = [
    [
        sText_JoinChatMale,
        sText_JoinChatFemale
    ], [
        sText_PlayerJoinChatMale,
        sText_PlayerJoinChatFemale
    ]
] as const;

export const gTexts_UR_WaitOrShowCard = [
    [
        sText_WaitForBattleMale,
        sText_WaitForChatMale,
        null,
        sText_ShowTrainerCardMale
    ], [
        sText_WaitForBattleFemale,
        sText_WaitForChatFemale,
        null,
        sText_ShowTrainerCardFemale
    ]
] as const;

export const gTexts_UR_StartActivity = [
    [
        [
            sText_BattleWillBeStarted,
            sText_EnteringChat,
            sText_TradeWillBeStarted
        ], [
            sText_BattleWillBeStarted,
            sText_EnteringChat,
            sText_TradeWillBeStarted
        ]
    ], [
        [
            sText_DoneWaitingBattleMale,
            sText_DoneWaitingChatMale,
            sText_TradeWillBeStarted
        ], [
            sText_DoneWaitingBattleFemale,
            sText_DoneWaitingChatFemale,
            sText_TradeWillBeStarted
        ]
    ]
] as const;

export const gTexts_UR_BattleDeclined = [
    sText_BattleDeclinedMale,
    sText_BattleDeclinedFemale
] as const;

export const gTexts_UR_ShowTrainerCardDeclined = [
    sText_ShowTrainerCardDeclinedMale,
    sText_ShowTrainerCardDeclinedFemale
] as const;

export const gTexts_UR_IfYouWantToDoSomething = [
    sText_IfYouWantToDoSomethingMale,
    sText_IfYouWantToDoSomethingFemale
] as const;

export const gTexts_UR_DeclineChat = [
    sText_DeclineChatMale,
    stext_DeclineChatFemale
] as const;

export const gTexts_UR_ChatDeclined = [
    sText_ChatDeclinedMale,
    sText_ChatDeclinedFemale
] as const;

export const gTexts_UR_BattleReaction = [
    [
        sText_YoureToughMale,
        sText_UsedGoodMoveMale,
        sText_BattleSurpriseMale,
        sText_SwitchedMonsMale
    ], [
        sText_YoureToughFemale,
        sText_UsedGoodMoveFemale,
        sText_BattleSurpriseFemale,
        sText_SwitchedMonsFemale
    ]
] as const;

export const gTexts_UR_ChatReaction = [
    [
        sText_LearnedSomethingMale,
        sText_ThatsFunnyMale,
        sText_RandomChatMale1,
        sText_RandomChatMale2
    ], [
        sText_LearnedSomethingFemale,
        sText_ThatsFunnyFemale,
        sText_RandomChatFemale1,
        sText_RandomChatFemale2
    ]
] as const;

export const gTexts_UR_TrainerCardReaction = [
    [
        sText_ShowedTrainerCardMale1,
        sText_ShowedTrainerCardMale2
    ], [
        sText_ShowedTrainerCardFemale1,
        sText_ShowedTrainerCardFemale2
    ]
] as const;

export const gTexts_UR_TradeReaction = [
    [
        sText_MaleTraded1,
        sText_MaleTraded2
    ], [
        sText_FemaleTraded1,
        sText_FemaleTraded2
    ]
] as const;

export const sCantTradeMonTexts = [
    sText_PlayerCantTradeForYourMon,
    sText_CantTradeForPartnersMon
] as const;

export const gTexts_UR_ChooseTrainer = designatedArray([
  [LINK_GROUP_SINGLE_BATTLE, sText_ChooseTrainerSingleBattle],
  [LINK_GROUP_DOUBLE_BATTLE, sText_ChooseTrainerDoubleBattle],
  [LINK_GROUP_MULTI_BATTLE, sText_ChooseLeaderMultiBattle],
  [LINK_GROUP_TRADE, sText_ChooseTrainerToTradeWith],
  [LINK_GROUP_POKEMON_JUMP, sText_ChooseLeaderPokemonJump],
  [LINK_GROUP_BERRY_CRUSH, sText_ChooseLeaderBerryCrush],
  [LINK_GROUP_BERRY_PICKING, sText_ChooseLeaderBerryPicking],
  [LINK_GROUP_WONDER_CARD, sText_ChooseTrainerToShareWonderCards],
  [LINK_GROUP_WONDER_NEWS, sText_ChooseTrainerToShareWonderNews],
]);

export const gTexts_UR_NoWonderShared = [
    sText_NoCardsSharedRightNow,
    sText_NoNewsSharedRightNow
] as const;

export const gTexts_UR_CardColor = [
    sText_ItsNormalCard,
    sText_ItsBronzeCard,
    sText_ItsCopperCard,
    sText_ItsSilverCard,
    sText_ItsGoldCard
] as const;

export const gTexts_UR_GladToMeetYou = [
    sText_GladToMeetYouMale,
    sText_GladToMeetYouFemale
] as const;

export interface MysteryGiftClientCmd { instr: number; parameter: number; }
export interface MysteryGiftServerCmd { instr: number; param?: number; ptr?: unknown; }

export const sClientScript_DynamicError: readonly MysteryGiftClientCmd[] = [
  { instr: CLI_RECV, parameter: MG_LINKID_DYNAMIC_MSG },
  { instr: CLI_COPY_MSG, parameter: 0 },
  { instr: CLI_SEND_READY_END, parameter: 0 },
  { instr: CLI_RETURN, parameter: CLI_MSG_BUFFER_FAILURE },
] as const;

export const gServerScript_ClientCanceledCard: readonly MysteryGiftServerCmd[] = [
  { instr: SVR_LOAD_CLIENT_SCRIPT, param: sClientScript_DynamicError.length, ptr: sClientScript_DynamicError },
  { instr: SVR_SEND },
  { instr: SVR_LOAD_MSG, param: sText_CanceledReadingCard.length + 1, ptr: sText_CanceledReadingCard },
  { instr: SVR_SEND },
  { instr: SVR_RECV, param: MG_LINKID_READY_END },
  { instr: SVR_RETURN, param: SVR_MSG_CLIENT_CANCELED },
] as const;
