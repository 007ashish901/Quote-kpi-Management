public class QuoteController{
 

     public class LineWrapper {
    @AuraEnabled public Id productId { get; set; }
    @AuraEnabled public Decimal unitPrice { get; set; }
    @AuraEnabled public Decimal costPrice { get; set; }
    @AuraEnabled public Decimal qty { get; set; }
    @AuraEnabled public Decimal discount { get; set; }
    @AuraEnabled public String tier { get; set; }
    @AuraEnabled public Decimal netTotal { get; set; }
}
    
    
    
    public class QuoteResponse{
        @AuraEnabled public Id quoteId {get; set;}
        @AuraEnabled public String quoteName {get; set;}
    }   

     @AuraEnabled
    public static QuoteResponse postQuotesAndQuoteLineItem(Id opportunityId, Decimal displayTotalCost, Decimal displayTotal, Decimal totalNetDiscount , Decimal totalNetPrice , Decimal discount, List<LineWrapper> quoteList) {
       
                Quote__c q = new Quote__c();
                q.Opportunity__c = opportunityId;
                q.Target_Margin__c = discount;
                q.Total_Amount__c  = displayTotal;
                q.Total_Cost__c = displayTotalCost; 
                q.Total_net_Discount__c = totalNetDiscount;
                 q.Total_Net_Price__c    = totalNetPrice;
                q.Status__c   = 'Draft';
                insert q;

              System.debug('Quote list: ' + JSON.serialize(quoteList));
              System.debug('Quote list size: ' + quoteList.size());

              List<Quote_Item__c>  qli = new List<Quote_Item__c>();

                for(LineWrapper l : quoteList){
                      Quote_Item__c ql = new Quote_Item__c();
                      ql.Quote__c = q.id;
                      ql.Product__c = l.productId;
                      ql.Quantity__c = l.qty;
                      ql.Net_Total__c = l.netTotal;
                      ql.Unit_Price__c = l.unitPrice;
                      ql.Cost_Price__c = l.costPrice;
                      ql.Discount_Pct__c = l.discount;
                      ql.Discount_Tier__c = l.tier;
                      qli.add(ql);
                }

                   for(LineWrapper l : quoteList){
                    system.debug(l.productId);
                    system.debug(l.qty);
                    system.debug(l.tier);
                   }

        if(qli.size() > 0){
                insert qli;
        }
        QuoteResponse res = new QuoteResponse();
        
        res.quoteId = q.Id;
        res.quoteName = q.Name;

        return res;
    }

}