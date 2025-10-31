<!DOCTYPE html>
<html>
<head>
    <title>{{ $messages['title'] }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #66BB6A;
            padding-bottom: 10px;
        }

        .faq-item {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }

        .question {
            font-weight: bold;
            color: #388E3C;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .answer {
            margin-left: 15px;
            line-height: 1.6;
            font-size: 12px;
        }

        .meta {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
        }

        .category-section {
            margin-top: 40px;
            page-break-before: always;
        }

        .category-title {
            font-size: 18px;
            font-weight: bold;
            color: #388E3C;
            margin-bottom: 20px;
            border-bottom: 1px solid #A8D8A8;
            padding-bottom: 5px;
        }

        @media print {
            body {
                margin: 0;
            }
        }
    </style>
</head>
<body>
<div class="header">
    <h1>{{ $messages['heading'] }}</h1>
    <p>{{ $messages['description'] }}</p>
    <p>{{ $messages['export_date'] }}</p>
    <p>{{ $messages['part'] }}: {{ $part }}</p>
</div>

<div class="category-section">
    <div class="category-title">{{ $messages['questions'] }}</div>
    <div class="faq-item">
        @php($index = 0)
        @foreach($faqs as $faq)
            <div class="question">{{ $index_start + $index }}. {!! $faq->question !!}</div>
            <div class="answer">{!! $faq->answer !!}</div>
            <div class="meta">{{ $messages['created_date'] }}: {{ $faq->created_at?->toDateTimeString() }} | {{ $messages['updated_date'] }}: {{ $faq->updated_at?->toDateTimeString() }}</div>
            <hr>
            @php($index++)
        @endforeach
    </div>
</div>
</body>
</html>
