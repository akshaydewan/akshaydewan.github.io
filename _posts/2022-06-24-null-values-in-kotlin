---
layout: post
title: Handling null values in Kotlin
date: '2022-06-24 00:00:00'
tags:
- kotlin
- programming
- code
---

## Introduction

Coming from Java development, one of the most prominent features of Kotlin is [null safety](https://kotlinlang.org/docs/null-safety.html). But while this feature is a huge benefit, it is not a silver bullet. I have seen that codebases tend to get littered with the `!!` operator all over the place, and we still end up with NullPointerExceptions.

This post doesn't talk about the _syntax_ of using null handling operators. There are a lot of good tutorials already available on that topic. Rather, I'll talk about the _semantics_ of nulls, and how to manage your code in a way that you don't end up with unnecessary null checks or `!!` operators everywhere.

First, let's look at what Kotlin is actually doing for you - it is providing type safety. What it means is that when you declare a variable as a `String?`, you are saying that this variable can hold a null or a String. The compiler then forces you to check for a null value before using this variable. Kotlin also gives you operators and functions to make these checks easier.

Next, let's take a look at what it means for a value to be null.

## Why values are null

There are many reasons why a value might turn out to be null. We'll explore the following scenarios -

1. Nullable values in a business context
2. Nullable return type from a function contract
3. Null values from outside data (and human behavior)

Let's explore them one by one.

## Nullable values in a business context

Let's say you're building an application for an e-commerce retail store. When users sign up on your site, they need to provide an email address and their full name. Optionally, they can also provide their phone number.

The representation of your user class may be something like this:

```kotlin
data class User(
    val email: String,
    val fullName: String,
    val phoneNumber: String?
)
```

As you can see, the phone number is nullable.

Now let's say that you are given a task to send out an SMS notification whenever a user makes a purchase. But what will you do if the user hasn't set a phone number? Well, **this should trigger a conversation with your BA or Product Owner**. You may decide to skip sending the SMS for such users, or you may send an email instead. Whatever it is you decide, it is almost never safe to use the `!!` operator for such scenarios.

While this may be a very simple example, in real projects, the domain tends to get quite complex and such instances can be overlooked.

In other cases, null values can be avoided by better domain modelling. Let's take the another example from the e-commerce store. While making a purchase, the user can choose to pay by cash on delivery, or they can pay by card. The class for an Order might look something like this:

```kotlin
data class Order(
    val item: String,
    val quantity: Int,
    val paymentMode: PaymentMode,
    val cardDetails: CardDetails?
)

enum class PaymentMode {
    CASH,
    CARD
}

data class CardDetails(
    val provider: String,
    val bank: String
)
```

In this example `cardDetails` will be null if the paymentMode is `CASH`. But we can refactor the model to avoid the nullable type

```kotlin
data class Order(
    val item: String,
    val quantity: Int,
    val paymentMode: PaymentMode
)

sealed class PaymentMode

object Cash : PaymentMode()

data class Card(
    val provider: String,
    val bank: String
) : PaymentMode()
```

This way, the Order class doesn't need to have a nullable CardDetails type. The `when` keyword can be used when accessing `order.paymentMode` to check what is the type of the payment mode.

## Nullable return type as a function contract

For this case, we can take the example of Kotlin's own standard library.

```kotlin
val collection = listOf("apples", "bananas", "mangoes")
val result = collection.find { it == "oranges" }
```

In this example, the `result` is null. The function contract is defined that way because it's possible that we won't find what we're looking for in the collection.

How we deal with this depends on the context. If "oranges" was a user-entered value, then we may want to show an error to the user, saying that the requested fruit was not found.

We can use similar contracts for our own functions. For example, while searching for a record in the database, it is possible that it won't be found. We can then return a nullable type from our function. The consumer of the function can decide how to handle this.

It is usually a bad idea to use the `!!` operator when we handle the result of such functions. To handle it correctly, **we may have to ask a business question and think about error handling and edge cases**.

## Null values from outside data (and human behavior)

Outside data is data that comes into the system from an _integration point_. An integration point is any external system that we communicate with. For example:

- APIs (including APIs that communicate with a frontend)
- Databases
- Uploaded Files (e.g. an application monitoring an S3 bucket for CSV files)

Thinking back to the online e-commerce store, let's say that we have wholesalers who post their catalog and prices as a CSV file. We read this CSV file and update our database accordingly. Later we use these data for re-filling our inventory, calculating profits and so on.

The (simplified) CSV file may look something like this:

```csv
item_id,name,price,expiry_date,item_type
987,Toothbrush,20,,NON_PERISHABLE,
648,Fountain Pen,50,,NON_PERISHABLE
375,Fresh Vegetables,30,2021-05-04,PERISHABLE
(..and so on...)
```

Note that we have Perishable items, Non-perishable items. Perishable items have an expiry date, but non-perishable items don't.

When we receive the file, we ingest it and update the catalog in our database. In Kotlin, we might create a corresponding data model for this CSV:

```kotlin
data class WholesalerCatalogLine(
    val itemId: String,
    val name: String,
    val price: BigDecimal,
    val itemType: String,
    val expiryDate: Date?,
)
```

Since we have been talking about nulls and data models previously in this post, you might have noticed that our class is actually a reflection of the CSV, but not how the _real_ domain model should be. As a programmer working on this task, I would be focussed on data ingestion and not domain modelling. And as far as ingestion is concerned, what we have done may be sufficient. The problem starts when a couple of weeks down the road, another programmer takes this forward, and **starts using the same class for building another feature**, like an inventory report. We're lazy humans, and we always tend to take the path of least resistance.

A better domain model for the wholesaler catalog might look something like this:

```kotlin
sealed class WholesalerCatalogItem {
    abstract val itemId: String
    abstract val name: String
    abstract val price: BigDecimal
}

data class NonPerishableItem(
    override val itemId: String,
    override val name: String,
    override val price: BigDecimal
): WholesalerCatalogItem()

data class PerishableItem(
    override val itemId: String,
    override val name: String,
    override val price: BigDecimal,
    val expiryDate: Date
): WholesalerCatalogItem()
```

I've taken the example of a CSV file, but the same problem can occur when we're building REST APIs and using a JSON to object mapping library. Let's take the same scenario, but instead of posting a CSV, the wholesaler is sending an API request:

```json
[
    {
        "itemId": 987,
        "name": "Toothbrush",
        "price": 20,
        "item_type": "NON_PERISHABLE"
    },
    {
        "itemId": 648,
        "name": "Fountain Pen",
        "price": 50,
        "item_type": "NON_PERISHABLE"
    },
    {
        "itemId": 375,
        "name": "Fresh Vegetables",
        "price": 30,
        "expiry_date": "2021-05-04"
        "item_type": "PERISHABLE"
    }
]
```

Web Frameworks (like Spring and Micronaut) provide some means of directly mapping JSON to objects using libraries like Jackson or GSON, or any library that we want to plug in. The problem is, we tend to directly map the JSON structure to a class, and that class becomes our domain model. In simple cases, this works just fine. But as the complexity of the model increases, mapping JSON objects to a class hierarchy becomes difficult. For example, to support polymorphic classes, some libraries may ask you to write custom serializers and deserializers. Jackson has annotations like `@JsonSubTypes` which can be used. But the solution is not trivial. And again, as humans, we tend to do what is easy - our domain model starts looking like the JSON representation from the API.

If you are using a database like MongoDB, you might see the same problem happen while reading from the database. SQL databases too have the same problem. We may use ORMs, but eventually we may find that our classes actually look more like database tables than actual domain models.

So what can we do? Unfortunately, there is no straightforward solution, but there are things we can keep in mind -

We need to be extra careful at our system boundaries. Patterns and practices like Layering, Domain-driven design, Hexagonal or Onion Architecture, Anti-corruption layers etc. are very useful. The central idea behind many of these architectures is to shield the "core" of the system from outside complexities. **It is better to do validations and null handling at our system boundaries**. It may not be necessary to be very strict about these patterns - you can be pragmatic and pick and choose what suits your application. But it's good to be aware of them and what problems they solve.

Always think of the domain model when you implement business logic. Don't let your model be influenced by the schema of "outside data" from APIs, DB tables etc.

Object mapping libraries can be a double edged sword. For cases where they are difficult to use, you can a separate Input or Request model and a separate Domain model.

## In conclusion

Bugs are an inevitable part of software development (at least until AI takes over). While it may not be possible to entirely avoid the use of the `!!` operator, its presence might point to a code smell. I hope this blog post has been of some help to identify and potentially improve the quality of your code.
