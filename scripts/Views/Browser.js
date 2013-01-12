


define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameList"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("DataFetcher/DataFetcherSnp"), DQXSC("ChannelPlot/ChannelSnps"), DQXSC("DataFetcher/DataFetcherFile")],
    function (require, Framework, Controls, Msg, DocEl, DQX, FrameList, GenomePlotter, DataFetcherSnp, ChannelSnps, DataFetcherFile) {

        var BrowserModule = {

            Instance: function (iPage, iFrame) {
                var that = Framework.ViewSet(iFrame, 'genome');
                that.myPage = iPage;
                that.myFrame = iFrame;
                that.registerView();
                that.refVersion = 2;

                that.createFramework = function () {

                    this.frameLeft = thePage.frameBody.addMemberFrame(Framework.FrameGroupVert('settings', 0.01))
                        .setMargins(5).setFixedSize(Framework.dimX, 330);

                    this.frameDataSource = this.frameLeft.addMemberFrame(Framework.FrameFinal('datasource', 0.3))
                        .setMargins(5).setDisplayTitle('Data source').setFixedSize(Framework.dimY, 100).setFixedSize(Framework.dimX, 330);

                    this.frameControls = this.frameLeft.addMemberFrame(Framework.FrameFinal('settings', 0.3))
                        .setMargins(5).setDisplayTitle('Settings').setFixedSize(Framework.dimX, 330);

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

                    if (this.refVersion == 2)
                        this.panelBrowser.getAnnotationFetcher().setFeatureType('gene', 'exon');
                    if (this.refVersion == 3)
                        this.panelBrowser.getAnnotationFetcher().setFeatureType('gene', 'CDS');

                    this.panelBrowser.getAnnotationChannel().setMinDrawZoomFactX(0.005);

                    this.panelBrowser.MaxZoomFactX = 1.0 / 0.2;
                    this.panelBrowser.getNavigator().setMinScrollSize(0.0001);


                    //Create snp view channel
                    var mydatafetcher_snps = new DataFetcherSnp.Fetcher(serverUrl, '', []);
                    //mydatafetcher_snps.parentIDs = sampleparents;

                    this.panelBrowser.addDataFetcher(mydatafetcher_snps);

                    this.SnpChannel = ChannelSnps.Channel('snps1', [], mydatafetcher_snps);
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
                    this.panelDataSource = Framework.Form(this.frameDataSource);
                    this.getDataSources();


                };

                that.getDataSources = function () {
                    DataFetcherFile.getFile(serverUrl, "SnpSets", $.proxy(this.handleGetDataSources, this));
                };

                that.handleGetDataSources = function (content) {
                    //alert(content);
                    var rows = content.split('\n');
                    var sources = [{ id: 'select', name: '- Select data source -'}];
                    for (var i = 0; i < rows.length; i++)
                        sources.push({ id: rows[i], name: rows[i] });
                    var group1 = this.panelDataSource.addControl(Controls.CompoundVert());
                    this.datasourcePicker = Controls.Combo('DataSource', { label: 'Data source:', value: 'select', states: sources })
                    group1.addControl(this.datasourcePicker);
                    this.datasourcePicker.setOnChanged($.proxy(this.changeDataSource, this));
                    this.infoBox = group1.addControl(Controls.Html('infoBox', ''));
                    this.panelDataSource.render();
                };

                that.changeDataSource = function () {
                    var dataSource = this.datasourcePicker.getValue();
                    DataFetcherFile.getFile(serverUrl, dataSource + "/_MetaData", $.proxy(this.handleChangeDataSource, this));
                }

                that.handleChangeDataSource = function (content) {
//                    this.infoBox.modifyValue(content);
                    var lines = content.split('\n');
                    this.sampleList = [];
                    this.parentList = [];
                    for (var linenr = 0; linenr < lines.length; linenr++) {
                        var line = lines[linenr];
                        var splitPos = line.indexOf('=');
                        if (splitPos > 0) {
                            var token = line.slice(0, splitPos);
                            var content = line.slice(splitPos + 1);
                            if (token == 'Samples')
                                this.sampleList = content.split('\t');
                            if (token == 'Parents')
                                this.ParentList = content.split('\t');
                        }
                    }
                    this.SnpChannel.setSampleList(this.datasourcePicker.getValue(), this.sampleList, this.ParentList);
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

                    group1.addControl(Controls.Check('CtrlFilterVCF', { label: 'Filter by VCF data', value:true })).setOnChanged(function (id, ctrl) {
                        that.SnpChannel.filter.applyVCFFilter = ctrl.getValue();
                        that.panelBrowser.render();
                    });
                    group1.addControl(Controls.Check('CtrlHideFiltered', { label: 'Hide filtered SNPs' })).setOnChanged(function (id, ctrl) {
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
                    this.panelBrowser.showRegion("Pf3D7_01", 0, 400000);
                }

                that.createChromosomesPFV3 = function () {
                    //Define chromosomes for version 3 of the reference genome
                    var chromoids = ['Pf3D7_01', 'Pf3D7_02', 'Pf3D7_03', 'Pf3D7_04', 'Pf3D7_05', 'Pf3D7_06', 'Pf3D7_07', 'Pf3D7_08', 'Pf3D7_09', 'Pf3D7_10', 'Pf3D7_11', 'Pf3D7_12', 'Pf3D7_13', 'Pf3D7_14'];
                    var chromosizes = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4];
                    for (var chromnr = 0; chromnr < chromoids.length; chromnr++) {
                        chromoids[chromnr] += '_v3';
                        this.panelBrowser.addChromosome(chromoids[chromnr], chromoids[chromnr], chromosizes[chromnr]);
                    }
                    //Startup the browser with a start region
                    this.panelBrowser.showRegion("Pf3D7_01_v3", 0, 400000);
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