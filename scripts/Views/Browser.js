
function translateChromoId(id) {// !!! this is a temperay hack to deal with the fact that we have inconsistent chromosome naming in the 2 data sets
    for (var i = 1; i <= 14; i++)
        if (id == 'MAL' + i) {
            var rs = "Pf3D7_" + ('0' + i).slice(-2) + "_v3";
            return rs;
        }
    throw "Invalid chromosome id"
}



define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("ChannelPlot/ChannelSequence"), DQXSC("ChannelPlot/ChannelSnps"), DQXSC("DataFetcher/DataFetcherFile")],
    function (require, Framework, Controls, Msg, DocEl, DQX, FrameList, GenomePlotter, ChannelSequence, ChannelSnps, DataFetcherFile) {

        var BrowserModule = {

            Instance: function (iPage, iFrame) {
                var that = Framework.ViewSet(iFrame, 'genome');
                that.myPage = iPage;
                that.myFrame = iFrame;
                that.registerView();
                that.refVersion = 3;

                that.dataLocation = "SnpDataCross";


                that.createFramework = function () {
                    this.frameLeft = thePage.frameBody.addMemberFrame(Framework.FrameGroupVert('settings', 0.01))
                        .setMargins(5).setFixedSize(Framework.dimX, 350);
                    this.frameDataSource = this.frameLeft.addMemberFrame(Framework.FrameFinal('datasource', 0.5))
                        .setMargins(5).setDisplayTitle('Data source').setFixedSize(Framework.dimX, 350);
                    this.frameControls = this.frameLeft.addMemberFrame(Framework.FrameFinal('settings', 0.7))
                        .setMargins(5).setDisplayTitle('Settings').setFixedSize(Framework.dimX, 350);
                    this.frameDetails = this.frameLeft.addMemberFrame(Framework.FrameFinal('details', 0.3))
                        .setMargins(5).setDisplayTitle('Details').setFixedSize(Framework.dimX, 350);
                    this.frameBrowser = thePage.frameBody.addMemberFrame(Framework.FrameFinal('browser', 0.7))
                        .setMargins(0).setDisplayTitle('Browser');
                    Msg.listen("", { type: 'JumpgenomeRegion' }, $.proxy(this.onJumpGenomeRegion, this));
                };

                that.createPanels = function () {
                    var browserConfig = {
                        serverURL: serverUrl,
                        chromnrfield: 'chromid'
                    };

                    if (this.refVersion == 2)
                        browserConfig.annotTableName = 'pfannot';
                    if (this.refVersion == 3)
                        browserConfig.annotTableName = 'pf3annot';

                    this.panelBrowser = GenomePlotter.Panel(this.frameBrowser, browserConfig);

                    SeqChannel = ChannelSequence.Channel(serverUrl, 'PfCross/Sequence', 'Summ01');
                    this.panelBrowser.addChannel(SeqChannel, true);
                    //SeqChannel.myfetcher.translateChromoId = translateChromoId;

                    if (this.refVersion == 2)
                        this.panelBrowser.getAnnotationFetcher().setFeatureType('gene', 'exon');
                    if (this.refVersion == 3)
                        this.panelBrowser.getAnnotationFetcher().setFeatureType('gene', 'CDS');

                    this.panelBrowser.getAnnotationChannel().setMinDrawZoomFactX(0.005);

                    this.panelBrowser.MaxZoomFactX = 1.0 / 0.2;
                    this.panelBrowser.getNavigator().setMinScrollSize(0.0001);


                    //Create snp view channel
                    this.SnpChannel = ChannelSnps.Channel('snps1', serverUrl);
                    this.SnpChannel.setTitle('Snps1');
                    this.SnpChannel.setHeight(400);
                    this.SnpChannel.setAutoFillHeight();
                    this.panelBrowser.addChannel(this.SnpChannel, true);

                    if (this.refVersion == 2)
                        this.createChromosomesPFV2();
                    if (this.refVersion == 3)
                        this.createChromosomesPFV3();

                    this.createControls();

                    //data source picker
                    this.panelDataSource = FrameList(this.frameDataSource);
                    Msg.listen('', { type: 'SelectItem', id: this.panelDataSource.getID() }, $.proxy(this.changeDataSource, this));
                    this.getDataSources();


                    //details panel
                    var frameDetails = Framework.Form(this.frameDetails);
                    this.details = frameDetails.addControl(Controls.Html('details', ''));
                    frameDetails.render();
                    Msg.listen('', { type: 'SnpInfoChanged', id: this.SnpChannel.getID() }, function (scope, content) {
                        that.details.modifyValue(content);
                    });

                    //Startup the browser with a start region
                    //setTimeout(function () {
                    this.panelBrowser.setPostInitialiseHandler(function () {
                        that.panelBrowser.showRegion(that.panelBrowser.getChromoID(1), 200000, 10000);
                    });
                    //}, 1);


                };

                that.getDataSources = function () {
                    DQX.setProcessing("Downloading...");
                    DataFetcherFile.getFile(serverUrl, that.dataLocation + "/SnpSets", $.proxy(this.handleGetDataSources, this));
                };

                that.handleGetDataSources = function (content) {
                    DQX.stopProcessing();
                    var rows = content.split('\n');
                    var it = [];
                    for (var i = 0; i < rows.length; i++)
                        if (rows[i])
                            it.push({
                                id: rows[i],
                                content: rows[i]
                            });
                    this.panelDataSource.setItems(it);
                    this.panelDataSource.render();
                    this.changeDataSource();
                    //setTimeout($.proxy(that.changeDataSource, that), 100);
                };

                that.changeDataSource = function () {
                    this.SnpChannel.setDataSource(that.dataLocation + '/' + this.panelDataSource.getActiveItem());
                }


                that.createControls = function () {
                    this.panelControls = Framework.Form(this.frameControls);

                    var group1 = this.panelControls.addControl(Controls.CompoundVert());

                    group1.addControl(Controls.Check('CtrlMagnif', { label: 'Show magnifying glass' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.useMagnifyingGlass = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    group1.addControl(Controls.Check('CtrlEquiDistant', { label: 'Equidistant blocks' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.fillBlocks = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    group1.addControl(Controls.Check('CtrlSmallBlocks', { label: 'Allow small blocks' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.allowSmallBlocks = ctrl.getValue();
                        that.panelBrowser.render();
                    });

                    group1.addControl(Controls.Check('CtrlFilterVCF', { label: 'Filter by VCF data', value: true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.applyVCFFilter = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    group1.addControl(Controls.Check('CtrlHideFiltered', { label: 'Hide filtered SNPs', value: true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.hideFiltered = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    group1.addControl(Controls.Check('CtrlRequireParents', { label: 'Require parents' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.requireParentsPresent = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    group1.addControl(Controls.Check('CtrlShowInheritance', { label: 'Show inheritance' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.colorByParent = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    group1.addControl(Controls.Button('CtrlSortParents', { content: 'Sort by parents' })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.sortByParents();
                    });

                    group1.addControl(Controls.ValueSlider('CtrlCoverage', { label: 'Coverage scale', width: 300, minval: 0, maxval: 200, value: 5, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setCoverageRange(ctrl.getValue());
                    });

                    group1.addControl(Controls.ValueSlider('CtrlMinSNPCov', { label: 'Min. SNP coverage', minval: 0, maxval: 200, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinSnpCoverage(ctrl.getValue());
                    });

                    group1.addControl(Controls.ValueSlider('CtrlMinAvgCov', { label: 'Min. avg. coverage', minval: 0, maxval: 200, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinAvgCoverage(ctrl.getValue());
                    });

                    group1.addControl(Controls.ValueSlider('CtrlMinSnpPurity', { label: 'Min. SNP purity', minval: 0, maxval: 1, startval: 0, digits: 2 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinSnpPurity(ctrl.getValue());
                    });

                    group1.addControl(Controls.ValueSlider('CtrlMinAvgPurity', { label: 'Min. avg. purity', minval: 0, maxval: 1, startval: 0, digits: 2 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinAvgPurity(ctrl.getValue());
                    });

                    group1.addControl(Controls.ValueSlider('CtrlPresence', { label: 'Min. % presence on samples', minval: 0, maxval: 100, startval: 0, digits: 0 })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.setMinPresence(ctrl.getValue());
                    });

                    this.panelControls.render();
                }


                that.createChromosomesPFV2 = function () {
                    //Define chromosomes for version 3 of the reference genome
                    var chromoids = ['Pf3D7_01', 'Pf3D7_02', 'Pf3D7_03', 'Pf3D7_04', 'Pf3D7_05', 'Pf3D7_06', 'Pf3D7_07', 'Pf3D7_08', 'Pf3D7_09', 'Pf3D7_10', 'Pf3D7_11', 'Pf3D7_12', 'Pf3D7_13', 'Pf3D7_14'];
                    var chromosizes = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4];
                    for (var chromnr = 0; chromnr < chromoids.length; chromnr++) {
                        this.panelBrowser.addChromosome(chromoids[chromnr], chromoids[chromnr], chromosizes[chromnr]);
                    }
                    //Startup the browser with a start region
                    this.panelBrowser.showRegion("Pf3D7_01", 0, 100000);
                }

                that.createChromosomesPFV3 = function () {
                    //Define chromosomes for version 3 of the reference genome
                    var chromoids = ['Pf3D7_01', 'Pf3D7_02', 'Pf3D7_03', 'Pf3D7_04', 'Pf3D7_05', 'Pf3D7_06', 'Pf3D7_07', 'Pf3D7_08', 'Pf3D7_09', 'Pf3D7_10', 'Pf3D7_11', 'Pf3D7_12', 'Pf3D7_13', 'Pf3D7_14'];
                    var chromosizes = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4];
                    for (var chromnr = 0; chromnr < chromoids.length; chromnr++) {
                        chromoids[chromnr] += '_v3';
                        this.panelBrowser.addChromosome(chromoids[chromnr], chromoids[chromnr], chromosizes[chromnr]);
                    }
                }


                //Call this function to jump to & highlight a specific region on the genome
                that.onJumpGenomeRegion = function (context, args) {
                    if ('chromoID' in args)
                        var chromoID = args.chromoID;
                    else {
                        DQX.assertPresence(args, 'chromNr');
                        var chromoID = this.panelBrowser.getChromoID(args.chromNr);
                    }
                    DQX.assertPresence(args, 'start'); DQX.assertPresence(args, 'end');
                    //this.activateState();
                    this.panelBrowser.highlightRegion(chromoID, (args.start + args.end) / 2, args.end - args.start);
                };

                return that;
            }

        };

        return BrowserModule;
    });