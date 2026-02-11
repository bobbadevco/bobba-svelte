import {
	CatalogPurchasedEvent,
	CatalogPurchaseFailureEvent,
	CatalogPurchaseSoldOutEvent, DispatchUiEvent,
	InventoryFurniAddedEvent, registerLocalStorage, registerMainEvent, registerMessageEvent,
	registerRoomEngineEvent,
	registerUiEvent
} from '$lib/events';
import {
	BuildersClubFurniCountMessageEvent,
	BuildersClubPlaceRoomItemMessageComposer,
	BuildersClubPlaceWallItemMessageComposer, BuildersClubSubscriptionStatusMessageEvent,
	CatalogPageMessageEvent,
	CatalogPagesListEvent,
	CatalogPublishedMessageEvent, ClubGiftInfoEvent, FrontPageItem,
	FurniturePlaceComposer,
	FurniturePlacePaintComposer, GetCatalogPageComposer,
	GetTickerTime, GiftWrappingConfigurationEvent,
	GuildMembershipsMessageEvent, HabboClubOffersMessageEvent, type IFurnitureData,
	type ILinkEventTracker,
	type IProductData,
	LegacyDataType, LimitedEditionSoldOutEvent,
	MarketplaceMakeOfferResult, NitroCommunicationDemoEvent, type NitroEvent, NodeData,
	ProductOfferEvent,
	PurchaseErrorMessageEvent, PurchaseOKMessageEvent,
	RoomControllerLevel,
	RoomEngineEvent,
	RoomEngineObjectPlacedEvent, RoomObjectCategory, RoomObjectPlacementSource, RoomObjectType, RoomObjectVariable, RoomPreviewer,
	SellablePetPalettesMessageEvent,
	Vector3d
} from '@nitrots/nitro-renderer';
import {
	AddEventLinkTracker,
	BuilderFurniPlaceableStatus, CatalogNode, CatalogPage, CatalogPetPalette,
	CatalogType, CreateLinkEvent, FurniCategory,
	GetFurnitureData, GetProductDataForLocalization, GetRoomEngine,
	GetRoomSession, GiftWrappingConfiguration, type ICatalogNode, type ICatalogOptions, type ICatalogPage,
	type IPageLocalization, type IProduct, type IPurchasableOffer, type IPurchaseOptions, LocalizeText,
	LocalStorageKeys, Offer, PageLocalization, PlacedObjectPurchaseData, PlaySound,
	Product, ProductTypeEnum, RequestedPage, SearchResult, SendMessageComposer, SoundNames
} from '$lib/api';
import { SvelteMap } from 'svelte/reactivity';
import { getAlertListener } from '$lib/listeners/AlertListener.svelte';
import { NotificationAlertType } from '$lib/api/notification/NotificationAlertType';
import { CatalogPurchaseConfirmationEvent } from '$lib/events/catalog/CatalogPurchaseConfirmationEvent';

const DRAG_AND_DROP_ENABLED = true;


class CatalogListener implements ILinkEventTracker {
	visible = $state(false);
	isBusy = $state(false);
	pageId = $state(-1);
	previousPageId = $state(-1);
	currentType = $state(CatalogType.NORMAL);
	rootNode = $state<ICatalogNode>();
	offersToNodes = new SvelteMap<number, ICatalogNode[]>();
	currentPage = $state<ICatalogPage>();
	currentOffer = $state<IPurchasableOffer>();
	activeNodes = $state<ICatalogNode[]>([]);
	searchResult = $state<SearchResult>();
	frontPageItems = $state<FrontPageItem[]>([]);
	roomPreviewer = $state<RoomPreviewer>();
	navigationHidden = $state(false);
	purchaseOptions = $state<IPurchaseOptions>({ quantity: 1, extraData: undefined, extraParamRequired: false, previewStuffData: undefined });
	catalogOptions = $state<ICatalogOptions>({});
	objectMoverRequested = $state(false);
	catalogPlaceMultipleObjects = registerLocalStorage(LocalStorageKeys.CATALOG_PLACE_MULTIPLE_OBJECTS, false)
	catalogSkipPurchaseConfirmation = registerLocalStorage(LocalStorageKeys.CATALOG_SKIP_PURCHASE_CONFIRMATION, false);
	purchasableOffer = $state<IPurchasableOffer>();
	placedObjectPurchaseData = $state<PlacedObjectPurchaseData>();
	furniCount = $state(0);
	furniLimit = $state(0);
	maxFurniLimit = $state(0);
	secondsLeft = $state(0);
	updateTime = $state(0);
	secondsLeftWithGrace = $state(0);
	requestedPage = new RequestedPage();
	eventUrlPrefix =  'catalog/';

	private static instance: CatalogListener;

	private static DUMMY_PAGE_ID_FOR_OFFER_SEARCH = -12345678;

	public constructor() {
		registerMainEvent(NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED, this.init.bind(this));
		registerRoomEngineEvent(RoomEngineEvent.ENGINE_INITIALIZED,
			() => this.roomPreviewer = new RoomPreviewer(GetRoomEngine(), ++RoomPreviewer.PREVIEW_COUNTER));
	}

	public static getInstance() {
		if (!CatalogListener.instance) {
			CatalogListener.instance = new CatalogListener();
		}
		return CatalogListener.instance;
	}

	public linkReceived(url: string) {
		const parts = url.split('/');

		if(parts.length < 2) return;

		switch(parts[1])
		{
			case 'show':
				this.visible = true;
				return;
			case 'hide':
				this.visible = false;
				return;
			case 'toggle':
				this.visible = !this.visible;
				return;
			case 'open':
				if(parts.length > 2)
				{
					if(parts.length === 4)
					{
						switch(parts[2])
						{
							case 'offerId':
								this.openPageByOfferId(parseInt(parts[3]));
								return;
						}
					}
					else
					{
						this.openPageByName(parts[2]);
					}
				}
				else
				{
					this.visible = true;
				}

				return;
		}
	}

	public requestOfferToMover(offer: IPurchasableOffer) {
		if(!this.isDraggable(offer)) return;

		const product = offer.product;

		if(!product) return;

		let category = 0;

		switch(product.productType)
		{
			case ProductTypeEnum.FLOOR:
				category = RoomObjectCategory.FLOOR;
				break;
			case ProductTypeEnum.WALL:
				category = RoomObjectCategory.WALL;
				break;
		}

		if(GetRoomEngine().processRoomObjectPlacement(RoomObjectPlacementSource.CATALOG, -(offer.offerId), category, product.productClassId, product.extraParam))
		{
			this.purchasableOffer = offer;
			this.objectMoverRequested = true;

			this.visible = false;
		}
	}

	public getNodeById(id: number, node: ICatalogNode) {
		if((node.pageId === id) && (node !== this.rootNode)) return node;

		for(const child of node.children)
		{
			const found = (this.getNodeById(id, child) as ICatalogNode);

			if(found) return found;
		}

		return undefined;
	}

	public getNodeByName(name: string, node: ICatalogNode) {
		if((node.pageName === name) && (node !== this.rootNode)) return node;

		for(const child of node.children)
		{
			const found = (this.getNodeByName(name, child) as ICatalogNode);

			if(found) return found;
		}

		return undefined;
	}

	public activateNode(targetNode: ICatalogNode, offerId: number = -1) {
		this.cancelObjectMover();

		if(targetNode.parent.pageName === 'root')
		{
			if(targetNode.children.length)
			{
				for(const child of targetNode.children)
				{
					if(!child.isVisible) continue;

					targetNode = child;

					break;
				}
			}
		}

		const nodes: ICatalogNode[] = [];

		let node = targetNode;

		while(node && (node.pageName !== 'root'))
		{
			nodes.push(node);

			node = node.parent;
		}

		nodes.reverse();

		const isActive = (this.activeNodes.indexOf(targetNode) >= 0);
		const isOpen = targetNode.isOpen;

		for(const existing of this.activeNodes)
		{
			existing.deactivate();

			if(nodes.indexOf(existing) === -1) existing.close();
		}

		for(const n of nodes)
		{
			n.activate();

			if(n.parent) n.open();

			if((n === targetNode.parent) && n.children.length) n.open();
		}

		if(isActive && isOpen) targetNode.close();
		else targetNode.open();

		this.activeNodes =  nodes;

		if(targetNode.pageId > -1) this.loadCatalogPage(targetNode.pageId, offerId);
	}

	public openPageById(id: number) {
		if(id !== -1) this.searchResult = undefined;

		if(!this.visible)
		{
			this.requestedPage.requestById = id;

			this.visible = true;
		}
		else
		{
			const node = this.getNodeById(id, this.rootNode || {} as ICatalogNode);

			if(node) this.activateNode(node);
		}
	}

	public openPageByName(name: string) {
		this.searchResult = undefined;

		if(!this.visible)
		{
			this.requestedPage.requestByName = name;

			this.visible = true;
		}
		else
		{
			const node = this.getNodeByName(name, this.rootNode || {} as ICatalogNode);

			if(node) this.activateNode(node);
		}
	}

	public openPageByOfferId(offerId: number) {
		this.searchResult = undefined;

		if(!this.visible)
		{
			this.requestedPage.requestedByOfferId = offerId;

			this.visible = true;
		}
		else
		{
			const nodes = this.getNodesByOfferId(offerId);

			if(!nodes || !nodes.length) return;

			this.activateNode(nodes[0], offerId);
		}
	}

	private resetState()	 {
		this.pageId = -1;
		this.previousPageId = -1;
		this.rootNode = undefined;
		this.offersToNodes.clear();
		this.currentPage = undefined;
		this.currentOffer = undefined;
		this.activeNodes = [];
		this.searchResult = undefined;
		this.frontPageItems = [];
		this.visible = false;
	}

	private getBuilderFurniPlaceableStatus(offer: IPurchasableOffer)	{
		if(!offer) return BuilderFurniPlaceableStatus.MISSING_OFFER;

		if((this.furniCount < 0) || (this.furniCount >= this.furniLimit)) return BuilderFurniPlaceableStatus.FURNI_LIMIT_REACHED;

		const roomSession = GetRoomSession();

		if(!roomSession) return BuilderFurniPlaceableStatus.NOT_IN_ROOM;

		if(!roomSession.isRoomOwner) return BuilderFurniPlaceableStatus.NOT_ROOM_OWNER;

		if(this.secondsLeft <= 0)
		{
			const roomEngine = GetRoomEngine();

			let objectCount = roomEngine.getRoomObjectCount(roomSession.roomId, RoomObjectCategory.UNIT);

			while(objectCount > 0)
			{
				const roomObject = roomEngine.getRoomObjectByIndex(roomSession.roomId, objectCount, RoomObjectCategory.UNIT);
				const userData = roomSession.userDataManager.getUserDataByIndex(roomObject.id);

				if(userData && (userData.type === RoomObjectType.USER) && (userData.roomIndex !== roomSession.ownRoomIndex) && !userData.isModerator) return BuilderFurniPlaceableStatus.VISITORS_IN_ROOM;

				objectCount--;
			}
		}

		return BuilderFurniPlaceableStatus.OKAY;
	}

	private isDraggable(offer: IPurchasableOffer)	{
		const roomSession = GetRoomSession();

		return ((DRAG_AND_DROP_ENABLED && roomSession && offer.page &&
					(offer.page.layoutCode !== 'sold_ltd_items') && (this.currentType === CatalogType.NORMAL) &&
					(roomSession.isRoomOwner || (roomSession.isGuildRoom &&
						(roomSession.controllerLevel >= RoomControllerLevel.GUILD_MEMBER)))) ||
				((this.currentType === CatalogType.BUILDER) &&
					(this.getBuilderFurniPlaceableStatus(offer) === BuilderFurniPlaceableStatus.OKAY)))
			&& (offer.pricingModel !== Offer.PRICING_MODEL_BUNDLE) && (offer.product.productType !== ProductTypeEnum.EFFECT)
			&& (offer.product.productType !== ProductTypeEnum.HABBO_CLUB);
	}

	private resetRoomPaint(planeType: string, type: string)	{

		const roomEngine = GetRoomEngine();

		let wallType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_WALL_TYPE);
		let floorType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_FLOOR_TYPE);
		let landscapeType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_LANDSCAPE_TYPE);

		wallType = (wallType && wallType.length) ? wallType : '101';
		floorType = (floorType && floorType.length) ? floorType : '101';
		landscapeType = (landscapeType && landscapeType.length) ? landscapeType : '1.1';

		switch(planeType)
		{
			case 'floor':
				roomEngine.updateRoomInstancePlaneType(roomEngine.activeRoomId, type, wallType, landscapeType, true);
				return;
			case 'wallpaper':
				roomEngine.updateRoomInstancePlaneType(roomEngine.activeRoomId, floorType, type, landscapeType, true);
				return;
			case 'landscape':
				roomEngine.updateRoomInstancePlaneType(roomEngine.activeRoomId, floorType, wallType, type, true);
				return;
			default:
				roomEngine.updateRoomInstancePlaneType(roomEngine.activeRoomId, floorType, wallType, landscapeType, true);
				return;
		}
	}

	private cancelObjectMover() {
		if(!this.purchasableOffer) return;

		GetRoomEngine().cancelRoomObjectInsert();

		this.objectMoverRequested = false;
		this.purchasableOffer = undefined;
	}

	private resetObjectMover(flag: boolean = true) {
		if(this.objectMoverRequested && flag)
		{
			CreateLinkEvent('catalog/open');
		}

		this.objectMoverRequested = false;
	}

	private resetPlacedOfferData(flag: boolean = false) {
		if(!flag) this.resetObjectMover();

		if(this.placedObjectPurchaseData)
		{
			switch(this.placedObjectPurchaseData.category)
			{
				case RoomObjectCategory.FLOOR:
					GetRoomEngine().removeRoomObjectFloor(this.placedObjectPurchaseData.roomId, this.placedObjectPurchaseData.objectId);
					break;
				case RoomObjectCategory.WALL: {

					switch(this.placedObjectPurchaseData.furniData.className)
					{
						case 'floor':
						case 'wallpaper':
						case 'landscape':
							this.resetRoomPaint('reset', '');
							break;
						default:
							GetRoomEngine().removeRoomObjectWall(this.placedObjectPurchaseData.roomId, this.placedObjectPurchaseData.objectId);
							break;
					}
					break;
				}
				default:
					GetRoomEngine().deleteRoomObject(this.placedObjectPurchaseData.objectId, this.placedObjectPurchaseData.category);
					break;
			}
		}
		this.placedObjectPurchaseData = undefined;
	}

	private getNodesByOfferId(offerId: number, flag: boolean = false) {
		if(!this.offersToNodes || !this.offersToNodes.size) return null;

		if(flag)
		{
			const nodes: ICatalogNode[] = [];
			const offers = this.offersToNodes.get(offerId);

			if(offers && offers.length) for(const offer of offers) {
				if (offer.isVisible) {
					nodes.push(offer);
				}
			}

			if(nodes.length) return nodes;
		}

		return this.offersToNodes.get(offerId);
	}

	private loadCatalogPage(pageId: number, offerId: number) {
		if(pageId < 0) return;

		this.isBusy = true;
		this.pageId = pageId;

		if(pageId > -1) SendMessageComposer(new GetCatalogPageComposer(pageId, offerId, this.currentType));
	}

	private showCatalogPage(pageId: number, layoutCode: string, localization: IPageLocalization,
													offers: IPurchasableOffer[], offerId: number,
													acceptSeasonCurrencyAsCredits: boolean) {
		const catalogPage = (new CatalogPage(pageId, layoutCode, localization, offers, acceptSeasonCurrencyAsCredits) as ICatalogPage);

		this.currentPage = catalogPage;
		this.previousPageId = (pageId !== -1) ? pageId : this.previousPageId;
		this.navigationHidden = false;

		if((offerId > -1) && catalogPage.offers.length)
		{
			for(const offer of catalogPage.offers)
			{
				if(offer.offerId !== offerId) continue;

				this.currentOffer = offer;

				break;
			}
		}
	}

	private refreshBuilderStatus() {}

	private init(_e: NitroEvent) {
		registerMessageEvent(CatalogPagesListEvent, this.onCatalogPagesList.bind(this));
		registerMessageEvent(CatalogPageMessageEvent, this.onCatalogPage.bind(this));
		registerMessageEvent(PurchaseOKMessageEvent, this.onPurchaseOK.bind(this));
		registerMessageEvent(PurchaseErrorMessageEvent, this.onPurchaseError.bind(this));
		registerMessageEvent(LimitedEditionSoldOutEvent, this.onLimitedEditionSoldOutEvent.bind(this));
		registerMessageEvent(ProductOfferEvent, this.onProductOffer.bind(this));
		registerMessageEvent(SellablePetPalettesMessageEvent, this.onSellablePetPalettes.bind(this));
		registerMessageEvent(HabboClubOffersMessageEvent, this.onHabboClubOffers.bind(this));
		registerMessageEvent(GuildMembershipsMessageEvent, this.onGuildMemberships.bind(this));
		registerMessageEvent(GiftWrappingConfigurationEvent, this.onGiftWrappingConfiguration.bind(this));
		registerMessageEvent(MarketplaceMakeOfferResult, this.onMarketplaceMakeOfferResult.bind(this));
		registerMessageEvent(ClubGiftInfoEvent, this.onClubGiftEvent.bind(this));
		registerMessageEvent(CatalogPublishedMessageEvent, this.onCatalogPublished.bind(this));
		registerMessageEvent(BuildersClubFurniCountMessageEvent, this.onBuildersClubFurniCount.bind(this));
		registerMessageEvent(BuildersClubSubscriptionStatusMessageEvent, this.onBuildersClubSubscriptionStatus.bind(this));

		registerRoomEngineEvent<RoomEngineObjectPlacedEvent>(RoomEngineObjectPlacedEvent.PLACED, this.onRoomEngineObjectPlaced.bind(this));

		registerUiEvent<CatalogPurchasedEvent>(CatalogPurchasedEvent.PURCHASE_SUCCESS, this.onCatalogPurchased.bind(this));
		registerUiEvent<InventoryFurniAddedEvent>(InventoryFurniAddedEvent.FURNI_ADDED, this.onInventoryFurniAdded.bind(this));

		AddEventLinkTracker(this);
	}

	private onCatalogPagesList(event: CatalogPagesListEvent) {
		const parser = event.getParser();
		const offers = new SvelteMap<number, ICatalogNode[]>();

		const getCatalogNode = (node: NodeData, depth: number, parent: ICatalogNode) =>
		{
			const catalogNode = (new CatalogNode(node, depth, parent) as ICatalogNode);

			for(const offerId of catalogNode.offerIds)
			{
				const xs = offers.get(offerId);
				if(xs) offers.set(offerId, [... xs, catalogNode]);
				else offers.set(offerId, [ catalogNode ]);
			}

			depth++;

			for(const child of node.children) catalogNode.addChild(getCatalogNode(child, depth, catalogNode));

			return catalogNode;
		}

		this.rootNode = getCatalogNode(parser.root, 0, {} as ICatalogNode);
		this.offersToNodes = offers;
	}

	private onCatalogPage(event: CatalogPageMessageEvent) {
		const parser = event.getParser();

		if(parser.catalogType !== this.currentType) return;

		const purchasableOffers: IPurchasableOffer[] = [];

		for(const offer of parser.offers)
		{
			const products: IProduct[] = [];
			const productData = GetProductDataForLocalization(offer.localizationId) || {} as IProductData;

			for(const product of offer.products)
			{
				const furnitureData = GetFurnitureData(product.furniClassId, product.productType) || {} as IFurnitureData;

				products.push(new Product(product.productType, product.furniClassId, product.extraParam, product.productCount,
					productData, furnitureData, product.uniqueLimitedItem, product.uniqueLimitedSeriesSize, product.uniqueLimitedItemsLeft));
			}

			if(!products.length) continue;

			const purchasableOffer = new Offer(offer.offerId, offer.localizationId, offer.rent, offer.priceCredits, offer.priceActivityPoints, offer.priceActivityPointsType, offer.giftable, offer.clubLevel, products, offer.bundlePurchaseAllowed);

			if((this.currentType === CatalogType.NORMAL) || ((purchasableOffer.pricingModel !== Offer.PRICING_MODEL_BUNDLE)
				&& (purchasableOffer.pricingModel !== Offer.PRICING_MODEL_MULTI))) purchasableOffers.push(purchasableOffer);
		}

		if(parser.frontPageItems && parser.frontPageItems.length) this.frontPageItems = parser.frontPageItems;

		this.isBusy = false;

		if(this.pageId === parser.pageId)
		{
			this.showCatalogPage(parser.pageId, parser.layoutCode,
				new PageLocalization(parser.localization.images.concat(), parser.localization.texts.concat()),
				purchasableOffers, parser.offerId, parser.acceptSeasonCurrencyAsCredits);
		}
	}

	private onPurchaseOK(event: PurchaseOKMessageEvent) {
		const parser = event.getParser();

		DispatchUiEvent(new CatalogPurchasedEvent(parser.offer));
	}

	private onPurchaseError(event: PurchaseErrorMessageEvent) {
		const parser = event.getParser();

		DispatchUiEvent(new CatalogPurchaseFailureEvent(parser.code));
	}

	private onLimitedEditionSoldOutEvent(_event: LimitedEditionSoldOutEvent) {
		DispatchUiEvent(new CatalogPurchaseSoldOutEvent());
	}

	private onProductOffer(event: ProductOfferEvent) {
		const parser = event.getParser();
		const offerData = parser.offer;

		if(!offerData || !offerData.products.length) return;

		const offerProductData = offerData.products[0];

		if(offerProductData.uniqueLimitedItem)
		{
			// update unique
		}

		const products: IProduct[] = [];
		const productData = GetProductDataForLocalization(offerData.localizationId) || {} as IProductData;

		for(const product of offerData.products)
		{
			const furnitureData = GetFurnitureData(product.furniClassId, product.productType) || {} as IFurnitureData;

			products.push(new Product(product.productType, product.furniClassId, product.extraParam, product.productCount, productData, furnitureData, product.uniqueLimitedItem, product.uniqueLimitedSeriesSize, product.uniqueLimitedItemsLeft));
		}

		const offer = new Offer(offerData.offerId, offerData.localizationId, offerData.rent, offerData.priceCredits, offerData.priceActivityPoints, offerData.priceActivityPointsType, offerData.giftable, offerData.clubLevel, products, offerData.bundlePurchaseAllowed);

		if(!((this.currentType === CatalogType.NORMAL) || ((offer.pricingModel !== Offer.PRICING_MODEL_BUNDLE) && (offer.pricingModel !== Offer.PRICING_MODEL_MULTI)))) return;

		offer.page = this.currentPage || {} as ICatalogPage;

		this.currentOffer = offer;

		if(offer.product && (offer.product.productType === ProductTypeEnum.WALL))
		{
			this.purchaseOptions.extraData = offer.product.extraParam || undefined;
		}
	}

	private onSellablePetPalettes(event: SellablePetPalettesMessageEvent) {
		const parser = event.getParser();
		const petPalette = new CatalogPetPalette(parser.productCode, parser.palettes.slice());

		const petPalettes = [];

		if(this.catalogOptions.petPalettes) petPalettes.push(...this.catalogOptions.petPalettes);

		for(let i = 0; i < petPalettes.length; i++)
		{
			const palette = petPalettes[i];

			if(palette.breed === petPalette.breed)
			{
				petPalettes.splice(i, 1);

				break;
			}
		}

		petPalettes.push(petPalette);

		this.catalogOptions = { ...this.catalogOptions, petPalettes };
	}

	private onHabboClubOffers(event: HabboClubOffersMessageEvent) {
		const parser = event.getParser();
		this.catalogOptions.clubOffers = parser.offers;
	}

	private onGuildMemberships(event: GuildMembershipsMessageEvent) {
		const parser = event.getParser();
		this.catalogOptions.groups = parser.groups;
	}

	private onGiftWrappingConfiguration(event: GiftWrappingConfigurationEvent) {
		const parser = event.getParser();
		const giftConfiguration = new GiftWrappingConfiguration(parser);
		this.catalogOptions = {...this.catalogOptions, giftConfiguration};
	}

	private onMarketplaceMakeOfferResult(event: MarketplaceMakeOfferResult) {
		const parser = event.getParser();

		if(!parser) return;

		let title: string;
		if(parser.result === 1)
		{
			title = LocalizeText('inventory.marketplace.result.title.success');
		}
		else
		{
			title = LocalizeText('inventory.marketplace.result.title.failure');
		}

		const message = LocalizeText(`inventory.marketplace.result.${ parser.result }`);

		getAlertListener().simpleAlert(message, NotificationAlertType.DEFAULT, undefined, undefined, title);
	}

	private onClubGiftEvent(event: ClubGiftInfoEvent) {
		const parser = event.getParser();
		this.catalogOptions =  { ...this.catalogOptions, clubGifts: parser };
	}

	private onCatalogPublished(_event: CatalogPublishedMessageEvent) {
		const wasVisible = this.visible;
		this.resetState();
		if(wasVisible) getAlertListener().simpleAlert(LocalizeText('catalog.alert.published.description'),
			NotificationAlertType.ALERT, undefined,
			undefined, LocalizeText('catalog.alert.published.title'));
	}

	private onBuildersClubFurniCount(event: BuildersClubFurniCountMessageEvent) {
		const parser = event.getParser();
		this.furniCount = parser.furniCount;
		this.refreshBuilderStatus();
	}

	private onBuildersClubSubscriptionStatus(event: BuildersClubSubscriptionStatusMessageEvent) {
		const parser = event.getParser();

		this.furniLimit = parser.furniLimit;
		this.maxFurniLimit = parser.maxFurniLimit;
		this.secondsLeft = parser.secondsLeft;
		this.updateTime = GetTickerTime();
		this.secondsLeftWithGrace = parser.secondsLeftWithGrace;

		this.refreshBuilderStatus();
	}

	private onRoomEngineObjectPlaced(event: RoomEngineObjectPlacedEvent) {
		if(!this.objectMoverRequested || (event.type !== RoomEngineObjectPlacedEvent.PLACED)) return;

		this.resetPlacedOfferData(true);

		if(!this.purchasableOffer)
		{
			this.resetObjectMover();

			return;
		}

		let placed: boolean;

		const product = this.purchasableOffer.product;

		if(event.category === RoomObjectCategory.WALL)
		{
			switch(product.furnitureData.className)
			{
				case 'floor':
				case 'wallpaper':
				case 'landscape':
					placed = (event.placedOnFloor || event.placedOnWall);
					break;
				default:
					placed = event.placedInRoom;
					break;
			}
		}
		else
		{
			placed = event.placedInRoom;
		}

		if(!placed)
		{
			this.resetObjectMover();

			return;
		}

		this.placedObjectPurchaseData = new PlacedObjectPurchaseData(event.roomId, event.objectId, event.category, event.wallLocation, event.x, event.y, event.direction, this.purchasableOffer);

		switch(this.currentType)
		{
			case CatalogType.NORMAL: {
				switch(event.category)
				{
					case RoomObjectCategory.FLOOR:
						GetRoomEngine().addFurnitureFloor(event.roomId, event.objectId, product.productClassId, new Vector3d(event.x, event.y, event.z), new Vector3d(event.direction), 0, new LegacyDataType());
						break;
					case RoomObjectCategory.WALL: {
						switch(product.furnitureData.className)
						{
							case 'floor':
							case 'wallpaper':
							case 'landscape':
								this.resetRoomPaint(product.furnitureData.className, product.extraParam);
								break;
							default:
								GetRoomEngine().addFurnitureWall(event.roomId, event.objectId, product.productClassId, new Vector3d(event.x, event.y, event.z), new Vector3d(event.direction * 45), 0, event.instanceData, 0);
								break;
						}
					}
				}

				const roomObject = GetRoomEngine().getRoomObject(event.roomId, event.objectId, event.category);

				if(roomObject) roomObject.model.setValue(RoomObjectVariable.FURNITURE_ALPHA_MULTIPLIER, 0.5);

				DispatchUiEvent(new CatalogPurchaseConfirmationEvent(this.purchasableOffer, this.pageId, product.extraParam, 1));

				if(this.catalogPlaceMultipleObjects) this.requestOfferToMover(this.purchasableOffer);
				break;
			}
			case CatalogType.BUILDER: {
				let pageId = this.purchasableOffer.page.pageId;

				if(pageId === CatalogListener.DUMMY_PAGE_ID_FOR_OFFER_SEARCH)
				{
					pageId = -1;
				}

				switch(event.category)
				{
					case RoomObjectCategory.FLOOR:
						SendMessageComposer(new BuildersClubPlaceRoomItemMessageComposer(pageId, this.purchasableOffer.offerId, product.extraParam, event.x, event.y, event.direction));
						break;
					case RoomObjectCategory.WALL:
						SendMessageComposer(new BuildersClubPlaceWallItemMessageComposer(pageId, this.purchasableOffer.offerId, product.extraParam, event.wallLocation));
						break;
				}

				if(this.catalogPlaceMultipleObjects) this.requestOfferToMover(this.purchasableOffer);
				break;
			}
		}
	}

	private onCatalogPurchased(_event: CatalogPurchasedEvent) {
		PlaySound(SoundNames.CREDITS);
	}

	private onInventoryFurniAdded(event: InventoryFurniAddedEvent) {
		const roomEngine = GetRoomEngine();

		if(!this.placedObjectPurchaseData || (this.placedObjectPurchaseData.productClassId !== event.spriteId) || (this.placedObjectPurchaseData.roomId !== roomEngine.activeRoomId)) return;

		switch(event.category)
		{
			case FurniCategory.FLOOR: {
				const floorType = roomEngine.getRoomInstanceVariable(roomEngine.activeRoomId, RoomObjectVariable.ROOM_FLOOR_TYPE);

				if(this.placedObjectPurchaseData.extraParam !== floorType) SendMessageComposer(new FurniturePlacePaintComposer(event.id));
				break;
			}
			case FurniCategory.WALL_PAPER: {
				const wallType = roomEngine.getRoomInstanceVariable(roomEngine.activeRoomId, RoomObjectVariable.ROOM_WALL_TYPE);

				if(this.placedObjectPurchaseData.extraParam !== wallType) SendMessageComposer(new FurniturePlacePaintComposer(event.id));
				break;
			}
			case FurniCategory.LANDSCAPE: {
				const landscapeType = roomEngine.getRoomInstanceVariable(roomEngine.activeRoomId, RoomObjectVariable.ROOM_LANDSCAPE_TYPE);

				if(this.placedObjectPurchaseData.extraParam !== landscapeType) SendMessageComposer(new FurniturePlacePaintComposer(event.id));
				break;
			}
			default:
				SendMessageComposer(new FurniturePlaceComposer(event.id, this.placedObjectPurchaseData.category,
					this.placedObjectPurchaseData.wallLocation, this.placedObjectPurchaseData.x,
					this.placedObjectPurchaseData.y, this.placedObjectPurchaseData.direction));
		}

		if(!this.catalogPlaceMultipleObjects) this.resetPlacedOfferData();
	}
}

export const getCatalogListener = () => CatalogListener.getInstance();