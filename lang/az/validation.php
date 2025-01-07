<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => ':attribute qəbul edilməlidir.',
    'accepted_if' => ':other :value olduqda, :attribute qəbul edilməlidir.',
    'active_url' => ':attribute etibarlı URL olmalıdır.',
    'after' => ':attribute sahəsi :date tarixindən sonra olmalıdır.',
    'after_or_equal' => ':attribute sahəsi :date tarixi ilə eyni və ya sonra bir tarix olmalıdır.',
    'alpha' => ':attribute sahəsi yalnız hərflərdən ibarət olmalıdır.',
    'alpha_dash' => ':attribute sahəsi yalnız hərflər, rəqəmlər, tirelər və alt xətlərdən ibarət olmalıdır.',
    'alpha_num' => ':attribute sahəsi yalnız hərflər və rəqəmlərdən ibarət olmalıdır.',
    'array' => ':attribute sahəsi massiv olmalıdır.',
    'ascii' => ':attribute sahəsi yalnız tək baytlı alfanümerik simvollar və simvollar içerməlidir.',
    'before' => ':attribute sahəsi :date tarixindən əvvəl bir tarix olmalıdır.',
    'before_or_equal' => ':attribute sahəsi :date tarixi ilə eyni və ya əvvəlki bir tarix olmalıdır.',
    'between' => [
        'array' => ':attribute sahəsində :min və :max arasında element olmalıdır.',
        'file' => ':attribute sahəsi :min və :max kilobayt arasında olmalıdır.',
        'numeric' => ':attribute sahəsi :min və :max arasında olmalıdır.',
        'string' => ':attribute sahəsi :min və :max simvol arasında olmalıdır.',
    ],
    'boolean' => ':attribute sahəsi doğru və ya yanlış olmalıdır.',
    'can' => ':attribute sahəsi icazəsiz bir dəyər ehtiva edir.',
    'confirmed' => ':attribute təsdiqi uyğun gəlmir.',
    'contains' => ':attribute sahəsi tələb olunan bir dəyəri əskikdir.',
    'current_password' => 'Şifrə səhvdir.',
    'date' => ':attribute sahəsi etibarlı tarix olmalıdır.',
    'date_equals' => ':attribute sahəsi :date tarixi ilə eyni tarix olmalıdır.',
    'date_format' => ':attribute sahəsi :format formatı ilə uyğun olmalıdır.',
    'decimal' => ':attribute sahəsi :decimal ondalık yerə malik olmalıdır.',
    'declined' => ':attribute sahəsi rədd edilməlidir.',
    'declined_if' => ':other :value olduqda, :attribute sahəsi rədd edilməlidir.',
    'different' => ':attribute sahəsi və :other fərqli olmalıdır.',
    'digits' => ':attribute sahəsi :digits rəqəm olmalıdır.',
    'digits_between' => ':attribute sahəsi :min və :max arasında rəqəm olmalıdır.',
    'dimensions' => ':attribute sahəsi etibarsız şəkil ölçülərinə malikdir.',
    'distinct' => ':attribute sahəsi təkrarlanan bir dəyərə malikdir.',
    'doesnt_end_with' => ':attribute sahəsi aşağıdakılardan biri ilə bitməməlidir: :values.',
    'doesnt_start_with' => ':attribute sahəsi aşağıdakılardan biri ilə başlamamalıdır: :values.',
    'email' => ':attribute sahəsi etibarlı bir e-poçt ünvanı olmalıdır.',
    'ends_with' => ':attribute sahəsi aşağıdakılardan biri ilə bitməlidir: :values.',
    'enum' => 'Seçilmiş :attribute etibarsızdır.',
    'exists' => 'Seçilmiş :attribute etibarsızdır.',
    'extensions' => ':attribute sahəsi aşağıdakı uzantılardan birinə malik olmalıdır: :values.',
    'file' => ':attribute sahəsi fayl olmalıdır.',
    'filled' => ':attribute sahəsində bir dəyər olmalıdır.',
    'gt' => [
        'array' => ':attribute sahəsində :value-dən çox element olmalıdır.',
        'file' => ':attribute sahəsi :value kilobaytdan böyük olmalıdır.',
        'numeric' => ':attribute sahəsi :value-dən böyük olmalıdır.',
        'string' => ':attribute sahəsi :value simvoldan böyük olmalıdır.',
    ],
    'gte' => [
        'array' => ':attribute sahəsində :value və daha çox element olmalıdır.',
        'file' => ':attribute sahəsi :value kilobayt və ya daha böyük olmalıdır.',
        'numeric' => ':attribute sahəsi :value və ya daha böyük olmalıdır.',
        'string' => ':attribute sahəsi :value simvol və ya daha böyük olmalıdır.',
    ],
    'hex_color' => ':attribute sahəsi etibarlı hexadecimal rəng olmalıdır.',
    'image' => ':attribute sahəsi şəkil olmalıdır.',
    'in' => 'Seçilmiş :attribute etibarsızdır.',
    'in_array' => ':attribute sahəsi :other içində mövcud olmalıdır.',
    'integer' => ':attribute sahəsi tam ədəd olmalıdır.',
    'ip' => ':attribute sahəsi etibarlı IP ünvanı olmalıdır.',
    'ipv4' => ':attribute sahəsi etibarlı IPv4 ünvanı olmalıdır.',
    'ipv6' => ':attribute sahəsi etibarlı IPv6 ünvanı olmalıdır.',
    'json' => ':attribute sahəsi etibarlı JSON simli olmalıdır.',
    'list' => ':attribute sahəsi siyahı olmalıdır.',
    'lowercase' => ':attribute sahəsi kiçik hərflə yazılmalıdır.',
    'lt' => [
        'array' => ':attribute sahəsində :value-dən az element olmalıdır.',
        'file' => ':attribute sahəsi :value kilobaytdan az olmalıdır.',
        'numeric' => ':attribute sahəsi :value-dən az olmalıdır.',
        'string' => ':attribute sahəsi :value simvoldan az olmalıdır.',
    ],
    'lte' => [
        'array' => ':attribute sahəsində :value-dən çox element olmamalıdır.',
        'file' => ':attribute sahəsi :value kilobaytdan az və ya bərabər olmalıdır.',
        'numeric' => ':attribute sahəsi :value-dən az və ya bərabər olmalıdır.',
        'string' => ':attribute sahəsi :value simvoldan az və ya bərabər olmalıdır.',
    ],
    'mac_address' => ':attribute sahəsi etibarlı MAC ünvanı olmalıdır.',
    'max' => [
        'array' => ':attribute sahəsində :max-dən çox element olmamalıdır.',
        'file' => ':attribute sahəsi :max kilobaytdan böyük olmamalıdır.',
        'numeric' => ':attribute sahəsi :max-dən böyük olmamalıdır.',
        'string' => ':attribute sahəsi :max simvoldan böyük olmamalıdır.',
    ],
    'max_digits' => ':attribute sahəsində :max-dən çox rəqəm olmamalıdır.',
    'mimes' => ':attribute sahəsi aşağıdakı tiplərdən birində fayl olmalıdır: :values.',
    'mimetypes' => ':attribute sahəsi aşağıdakı tiplərdən birində fayl olmalıdır: :values.',
    'min' => [
        'array' => ':attribute sahəsində ən azı :min element olmalıdır.',
        'file' => ':attribute sahəsi ən azı :min kilobayt olmalıdır.',
        'numeric' => ':attribute sahəsi ən azı :min olmalıdır.',
        'string' => ':attribute sahəsi ən azı :min simvol olmalıdır.',
    ],
    'min_digits' => ':attribute sahəsində ən azı :min rəqəm olmalıdır.',
    'missing' => ':attribute sahəsi əskik olmalıdır.',
    'missing_if' => ':other :value olduqda, :attribute sahəsi əskik olmalıdır.',
    'missing_unless' => ':other :value olmadığı halda, :attribute sahəsi əskik olmalıdır.',
    'missing_with' => ':values mövcud olduqda, :attribute sahəsi əskik olmalıdır.',
    'missing_with_all' => ':values mövcud olduqda, :attribute sahəsi əskik olmalıdır.',
    'multiple_of' => ':attribute sahəsi :value-in çoxluğu olmalıdır.',
    'not_in' => 'Seçilmiş :attribute etibarsızdır.',
    'not_regex' => ':attribute sahəsinin formatı etibarsızdır.',
    'numeric' => ':attribute sahəsi rəqəm olmalıdır.',
    'password' => [
        'letters' => ':attribute sahəsində ən azı bir hərf olmalıdır.',
        'mixed' => ':attribute sahəsində ən azı bir böyük və bir kiçik hərf olmalıdır.',
        'numbers' => ':attribute sahəsində ən azı bir rəqəm olmalıdır.',
        'symbols' => ':attribute sahəsində ən azı bir simvol olmalıdır.',
        'uncompromised' => 'Verilən :attribute məlumat sızıntıda tapılmışdır. Zəhmət olmasa, fərqli bir :attribute seçin.',
    ],
    'present' => ':attribute sahəsi mövcud olmalıdır.',
    'present_if' => ':other :value olduqda, :attribute sahəsi mövcud olmalıdır.',
    'present_unless' => ':other :value olmadığı halda, :attribute sahəsi mövcud olmalıdır.',
    'present_with' => ':values mövcud olduqda, :attribute sahəsi mövcud olmalıdır.',
    'present_with_all' => ':values mövcud olduqda, :attribute sahəsi mövcud olmalıdır.',
    'prohibited' => ':attribute sahəsi qadağandır.',
    'prohibited_if' => ':other :value olduqda, :attribute sahəsi qadağandır.',
    'prohibited_unless' => ':other :values içində olmadığı halda, :attribute sahəsi qadağandır.',
    'prohibits' => ':attribute sahəsi :other-nin mövcud olmasını qadağan edir.',
    'regex' => ':attribute sahəsinin formatı etibarsızdır.',
    'required' => ':attribute sahəsi tələb olunur.',
    'required_array_keys' => ':attribute sahəsi aşağıdakı daxilolmaları əhatə etməlidir: :values.',
    'required_if' => ':other :value olduqda, :attribute sahəsi tələb olunur.',
    'required_if_accepted' => ':other qəbul edildikdə, :attribute sahəsi tələb olunur.',
    'required_if_declined' => ':other rədd edildikdə, :attribute sahəsi tələb olunur.',
    'required_unless' => ':other :values içində olmadığı halda, :attribute sahəsi tələb olunur.',
    'required_with' => ':values mövcud olduqda, :attribute sahəsi tələb olunur.',
    'required_with_all' => ':values mövcud olduqda, :attribute sahəsi tələb olunur.',
    'required_without' => ':values mövcud olmadıqda, :attribute sahəsi tələb olunur.',
    'required_without_all' => ':values heç biri mövcud olmadıqda, :attribute sahəsi tələb olunur.',
    'same' => ':attribute sahəsi :other ilə uyğun olmalıdır.',
    'size' => [
        'array' => ':attribute sahəsi :size elementə malik olmalıdır.',
        'file' => ':attribute sahəsi :size kilobayt olmalıdır.',
        'numeric' => ':attribute sahəsi :size olmalıdır.',
        'string' => ':attribute sahəsi :size simvol olmalıdır.',
    ],
    'starts_with' => ':attribute sahəsi aşağıdakılardan biri ilə başlamalıdır: :values.',
    'string' => ':attribute sahəsi mətn olmalıdır.',
    'timezone' => ':attribute sahəsi etibarlı bir zaman zonası olmalıdır.',
    'unique' => ':attribute artıq götürülüb.',
    'uploaded' => ':attribute yüklənməyib.',
    'uppercase' => ':attribute sahəsi böyük hərflə yazılmalıdır.',
    'url' => ':attribute sahəsi etibarlı URL olmalıdır.',
    'ulid' => ':attribute sahəsi etibarlı ULID olmalıdır.',
    'uuid' => ':attribute sahəsi etibarlı UUID olmalıdır.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [],

];
