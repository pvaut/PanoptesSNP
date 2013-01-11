define([DQXSC("Framework"), DQXSC("HistoryManager"), DQXSC("DocEl"), DQXSC("Msg"), "Views/Browser"],
    function (Framework, HistoryManager, DocEl, Msg, BrowserModule) {
        thePage = {

            createFramework: function () {

                thePage.frameRoot = Framework.FrameGroupVert('');
                thePage.frameRoot.setMargins(0);

                //The top line of the page
                thePage.frameHeaderIntro = thePage.frameRoot.addMemberFrame(Framework.FrameFinal('HeaderIntro', 1))
                    .setFixedSize(Framework.dimY, 2).setFrameClassClient('DQXPage');

                //The body panel of the page
                thePage.frameBody = thePage.frameRoot.addMemberFrame(Framework.FrameGroupHor('info', 1)).setFrameClassClient('DQXDarkFrame').setMargins(8);

                thePage.BrowserView = BrowserModule.Instance(thePage, thePage.frameBody);
                thePage.BrowserView.createFramework();

            },



        };

        return thePage;
    });
