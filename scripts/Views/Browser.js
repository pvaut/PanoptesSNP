
dataid = null;

if (!dataid)
    dataid = 'SNP-svar1';

if (dataid == 'SNP-3d7xHb3_qcPlusSamples-01') {
    samplestring = "PG0051-C	PG0052-C	PG0053-C	PG0054-C	PG0056-C	PG0057-C	PG0058-C	PG0060-C	PG0061-C	PG0062-C	PG0063-C	PG0064-C	PG0065-C	PG0066-C	PG0067-C	PG0068-C	PG0069-C	PG0070-C	PG0071-C	PG0072-C";
    samples = samplestring.split('\t');
    sampleparents = ['PG0051-C', 'PG0052-C'];
}

if (dataid == 'SNP-7g8xGb4-allSamples-01') {
    samplestring = "PG0083-C	PG0084-C	PG0077-CW	PG0078-CW	PG0079-CW	PG0080-C	PG0081-CW	PG0082-C	PG0085-C	PG0086-CW	PG0087-C	PG0088-C	PG0090-CW	PG0091-C	PG0092-C	PG0093-C	PG0094-CW	PG0095-CW	PG0096-C	PG0097-C	PG0098-C	PG0099-C	PG0100-CW	PG0101-C	PG0102-CW	PG0103-CW	PG0104-CW	PG0105-CW	PG0106-C	PG0107-C	PG0108-C	PG0109-C	PG0110-CW	PG0111-CW	PG0112-CW	PG0113-CW";
    samples = samplestring.split('\t');
    sampleparents = ['PG0083-C', 'PG0084-C'];
}

if (dataid == 'SNP-Hb3xDd2-allSamples-01') {
    samplestring = "PG0004-CW	PG0008-CW	PG0022-Cx	PG0015-C	PG0016-C	PG0017-C	PG0018-C	PG0019-C	PG0020-C	PG0021-C	PG0023-C	PG0024-C	PG0025-C	PG0026-C	PG0027-C	PG0028-C	PG0029-Cx	PG0030-C	PG0031-C	PG0032-Cx	PG0033-C	PG0034-C	PG0035-Cx	PG0036-C	PG0037-C	PG0038-C	PG0039-C	PG0040-Cx	PG0041-C	PG0042-C	PG0043-C	PG0044-C	PG0045-C	PG0046-Cx	PG0047-C	PG0048-C	PG0074-C";
    samples = samplestring.split('\t');
    sampleparents = ['PG0004-CW', 'PG0008-CW'];
}

if (dataid == 'SNP-svar1') {
    samplestring = "PG0051-C	PG0052-C	PG0053-C	PG0054-C	PG0056-C	PG0057-C	PG0058-C	PG0060-C	PG0061-C	PG0062-C	PG0063-C	PG0064-C	PG0065-C	PG0066-C	PG0067-C	PG0068-C	PG0069-C	PG0070-C	PG0071-C	PG0072-C";
    samples = samplestring.split('\t');
    sampleparents = ['PG0051-C', 'PG0052-C'];
}


define([DQXSCRQ(), DQXSC("Framework"), DQXSC("Controls"), DQXSC("Msg"), DQXSC("DocEl"), DQXSC("Utils"), DQXSC("FrameTree"), DQXSC("ChannelPlot/GenomePlotter"), DQXSC("DataFetcher/DataFetcherSnp"), DQXSC("ChannelPlot/ChannelSnps")],
    function (require, Framework, Controls, Msg, DocEl, DQX, FrameTree, GenomePlotter, DataFetcherSnp, ChannelSnps) {

        var BrowserModule = {

            Instance: function (iPage, iFrame) {
                var that = Framework.ViewSet(iFrame, 'genome');
                that.myPage = iPage;
                that.myFrame = iFrame;
                that.registerView();
                that.refVersion = 2;

                that.createFramework = function () {

                    this.frameControls = thePage.frameBody.addMemberFrame(Framework.FrameFinal('settings', 0.3))
                        .setMargins(5).setDisplayTitle('Settings');

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
                    var mydatafetcher_snps = new DataFetcherSnp.Fetcher(serverUrl, dataid, samples);
                    mydatafetcher_snps.parentIDs = sampleparents;

                    this.panelBrowser.addDataFetcher(mydatafetcher_snps);

                    this.SnpChannel = ChannelSnps.Channel('snps1', samples, mydatafetcher_snps);
                    this.SnpChannel.setTitle('Snps1');
                    this.SnpChannel.setHeight(400);
                    this.SnpChannel.setAutoFillHeight();
                    this.panelBrowser.addChannel(this.SnpChannel, true);

                    if (this.refVersion == 2)
                        this.createChromosomesPFV2();
                    if (this.refVersion == 3)
                        this.createChromosomesPFV3();

                    this.createControls();

                };

                that.createControls = function () {
                    this.panelControls = Framework.Form(this.frameControls);

                    var group1 = this.panelControls.addControl(Controls.CompoundVert());


                    group1.addControl(Controls.Check('CtrlMagnif', { label: 'Show magnifying glass' })).setOnChanged(function (id,ctrl) {
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

                    group1.addControl(Controls.Check('CtrlFilterVCF', { label: 'Filter by VCF data' })).setOnChanged(function (id, ctrl) {
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