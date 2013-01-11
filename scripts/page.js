define([DQXSC("Framework"), DQXSC("HistoryManager"), DQXSC("DocEl"), DQXSC("Msg"), DQXSC("DataFetcher/DataFetcherFile"), "Views/Browser"],
    function (Framework, HistoryManager, DocEl, Msg, DataFetcherFile, BrowserModule) {
        thePage = {

            createFramework: function () {

                thePage.frameRoot = Framework.FrameGroupVert('');
                thePage.frameRoot.setMargins(0);

                //The top line of the page
                thePage.frameHeaderIntro = thePage.frameRoot.addMemberFrame(Framework.FrameFinal('HeaderIntro', 1))
                    .setFixedSize(Framework.dimY, 50).setFrameClassClient('DQXPage');

                //The body panel of the page
                thePage.frameBody = thePage.frameRoot.addMemberFrame(Framework.FrameGroupHor('info', 1)).setFrameClassClient('DQXDarkFrame').setMargins(8);

                thePage.BrowserView = BrowserModule.Instance(thePage, thePage.frameBody);
                thePage.BrowserView.createFramework();

            },

            getMetaData: function () {
                //DataFetcherFile.getFile(serverUrl, "SnpSets", thePage.handleGetMetaData);
                DataFetcherFile.getFile(serverUrl, "SNP-svar1/_MetaData", thePage.handleGetMetaData);
            },

            handleGetMetaData: function (content) {
                //alert(content);
                var rows = content.split('\n');
            }


        };

        return thePage;
    });
