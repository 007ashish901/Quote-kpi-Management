public class getProductName {
    @AuraEnabled(cacheable=true)
    public static List<product2> name(String proName){
        
             System.debug(proName);
               return [select ID , Name from product2 where Name LIKE : (proName + '%')];
    }
}