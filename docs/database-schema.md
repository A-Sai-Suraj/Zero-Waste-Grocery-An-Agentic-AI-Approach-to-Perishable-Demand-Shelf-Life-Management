# ZeroWaste AI Prisma ER Diagram and Relationship Table

## Mermaid ER diagram

```mermaid
erDiagram
    USER ||--o{ MANAGER_APPROVAL : approves
    USER }o--|| STORE : assigned_to
    STORE ||--o{ INVENTORY_BATCH : manages
    STORE ||--o{ SALES_HISTORY : records
    STORE ||--o{ DEMAND_FORECAST : forecasts
    STORE ||--o{ WEATHER_EVENT : observes
    STORE ||--o{ PROMOTION : launches
    STORE ||--o{ RECOMMENDATION : owns
    PRODUCT_CATEGORY ||--o{ PRODUCT : groups
    PRODUCT ||--o{ INVENTORY_BATCH : stocks
    PRODUCT ||--o{ SALES_HISTORY : sells
    PRODUCT ||--o{ DEMAND_FORECAST : forecasts
    PRODUCT ||--o{ RECOMMENDATION_ITEM : appears_in
    INVENTORY_BATCH ||--o{ SPOILAGE_RISK_PREDICTION : scored
    RECOMMENDATION ||--o{ RECOMMENDATION_ITEM : includes
    RECOMMENDATION_ITEM ||--o{ PROPOSED_ACTION : describes
    RECOMMENDATION ||--o{ MANAGER_APPROVAL : reviewed_by
    SUPPLIER ||--o{ DELIVERY_RECORD : ships

    USER {
      string id PK
      string email UK
      string name
      UserRole role
      string storeId FK
    }

    STORE {
      string id PK
      string name
      string location
      string timezone
    }

    PRODUCT_CATEGORY {
      string id PK
      string name
    }

    PRODUCT {
      string id PK
      string sku UK
      string name
      string categoryId FK
      string unit
    }

    INVENTORY_BATCH {
      string id PK
      string storeId FK
      string productId FK
      int quantity
      datetime expiryDate
      InventoryStatus status
    }

    SALES_HISTORY {
      string id PK
      string storeId FK
      string productId FK
      int soldQty
      decimal revenue
      datetime transactionDate
    }

    SUPPLIER {
      string id PK
      string name
    }

    DELIVERY_RECORD {
      string id PK
      string supplierId FK
      datetime orderDate
      decimal amount
    }

    PROMOTION {
      string id PK
      string storeId FK
      string name
      decimal discountPct
      datetime activeFrom
    }

    WEATHER_EVENT {
      string id PK
      string storeId FK
      string eventType
      datetime eventDate
    }

    DEMAND_FORECAST {
      string id PK
      string storeId FK
      string productId FK
      decimal forecastQty
      decimal confidence
      datetime forecastDate
    }

    SPOILAGE_RISK_PREDICTION {
      string id PK
      string batchId FK
      decimal riskScore
      string riskLevel
      int daysToExpiry
    }

    RECOMMENDATION {
      string id PK
      string storeId FK
      string summary
      RecommendationStatus status
    }

    RECOMMENDATION_ITEM {
      string id PK
      string recommendationId FK
      string productId FK
      ActionType actionType
      int quantity
    }

    PROPOSED_ACTION {
      string id PK
      string recommendationItemId FK
      ActionType actionType
      string targetStoreId
    }

    MANAGER_APPROVAL {
      string id PK
      string recommendationId FK
      string approverId FK
      ApprovalDecision decision
      string comments
    }

    AUDIT_LOG {
      string id PK
      string entityType
      string entityId
      string action
      json details
    }

    EVALUATION_RESULT {
      string id PK
      datetime evaluationDate
      string metricName
      decimal metricValue
    }
```

## Relationship table

| Table | Relationship | Cardinality | Notes |
|---|---|---|---|
| `Store` -> `User` | one store has many users | 1:N | store assignment for admins and managers |
| `Store` -> `InventoryBatch` | one store has many batch records | 1:N | batch-level expiry and quantity |
| `Product` -> `InventoryBatch` | one product has many batches | 1:N | same SKU may exist across stores and batch lifecycles |
| `Product` -> `SalesHistory` | one product has many sales rows | 1:N | supports forecasting and demand analysis |
| `Product` -> `DemandForecast` | one product has many forecast rows | 1:N | forecast by horizon and date |
| `Store` -> `DemandForecast` | one store has many forecast rows | 1:N | per-store forecast planning |
| `InventoryBatch` -> `SpoilageRiskPrediction` | one batch has many spoilage predictions | 1:N | risk score history per batch |
| `Recommendation` -> `RecommendationItem` | one recommendation has many items | 1:N | each item is one action candidate |
| `RecommendationItem` -> `ProposedAction` | one item has many action details | 1:N | action objects for replenish, markdown, transfer |
| `Recommendation` -> `ManagerApproval` | one recommendation has many approval records | 1:N | approval, rejection, or pending state |
| `User` -> `ManagerApproval` | one user can approve many recommendations | 1:N | approver identity |
| `Store` -> `Promotion` | one store has many promotions | 1:N | markdown campaign context |
| `Store` -> `WeatherEvent` | one store has many weather records | 1:N | forecasting features |
| `Supplier` -> `DeliveryRecord` | one supplier has many deliveries | 1:N | inbound replenishment flow |
| `AuditLog` -> `User` | audit log may reference actor | N:1 optional | actions and traceability |

## Important modeling rules

- Inventory expiry is stored at the `InventoryBatch` level instead of on the product master record.
- Demand forecasts are per store and product for a given date horizon.
- Recommendation generation is separate from executed inventory changes to preserve auditability.
- Manager approvals are persisted in a dedicated approval table rather than storing approval directly on recommendation items.
