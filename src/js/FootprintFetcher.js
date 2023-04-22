export async function FetchObjects(objInfo) {

    let inputWasSingleString = false;

    // function overload handling
    if(typeof objInfo === "string"){
        objInfo = { "defaultKey" : objInfo };
        inputWasSingleString = true;
    }

    // Promise Tracking
    let fetchPromise = {};
    let jsonPromise = {};
    // Result
    let jsonRes = {};


    // For each url given
    for(const key in objInfo) {

        // Fetch JSON from url and read into object
        fetchPromise[key] = fetch(
            objInfo[key]
        ).then((res)=>{
            jsonPromise[key] = res.json().then((jsonData)=>{
                jsonRes[key] = jsonData;
            }).catch((err)=>{
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    // Wait for each query to complete
    for(const key in objInfo){
        await fetchPromise[key];
        await jsonPromise[key];
    }

    // After waiting, this contains footprints
    if(inputWasSingleString) return jsonRes["defaultKey"];
    else return jsonRes;
}

/** Identifies a collection (from those passed in) based on id and fetches footprints from that collection according to query
 * @async
 * @param {array} collection - A collection with a url property.
 * @param {string} collectionId - The id of the collection to fetch from.
 * @param {string} queryString - The query to narrow the results returned from the collection.
 */
export async function FetchFootprints(collection, page, step){

    let pageInfo = "";
    if(collection.url.slice(-1) !== "?") {
        pageInfo += "&"
    }
    pageInfo += "page=" + page;
    if (step != 10){
      pageInfo += "&limit=" + step;
    }

    let jsonRes = await FetchObjects(collection.url + pageInfo);
    return jsonRes.features;
}

export async function FetchStepRemainder(featureCollection, myStep){
    let myPage = Math.ceil(featureCollection.features.length / myStep);
    let skip = featureCollection.features.length % myStep;
    let newFeatures = [];

    if (skip !== 0) {
      newFeatures = await FetchFootprints(featureCollection, myPage, myStep);

      // If any features are returned, add the remainder needed to the current collection
      if (newFeatures.length > 0) {
        return newFeatures.slice(skip, newFeatures.length);
      }
    }
    return newFeatures;
  }