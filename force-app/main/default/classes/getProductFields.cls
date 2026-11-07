public class getProductFields {
     @AuraEnabled(cacheable=true)        
     public static ProductWrapper getProductDetails(String id) {

    Product2 product = [
        SELECT Id, Name, ProductCode  
        FROM Product2
        WHERE Id = :id
        LIMIT 1
    ];

    PricebookEntry entrie = [
        SELECT Id, UnitPrice, Pricebook2.Name
        FROM PricebookEntry
        WHERE Product2Id = :id LIMIT 1
    ];

     
     system.debug(new ProductWrapper(product, entrie));
    return new ProductWrapper(product, entrie);
}
        
    }