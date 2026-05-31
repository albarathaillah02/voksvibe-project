@extends('layouts.app') {{-- Sesuaikan dengan nama template/master layout Anda --}}

@section('content')
<div class="w-full min-h-screen py-12 px-6 md:px-16" style="background-color: #FCFBE3; color: #000000;">
    
    <div class="max-w-6xl mx-auto">
        <div class="border-b border-black pb-2 mb-10">
            <h2 class="text-sm md:text-base font-bold tracking-widest uppercase font-mono">
                ABOUT US
            </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            
            <div class="w-full bg-black p-6 flex justify-center items-center shadow-sm">
                <img src="{{ asset('images/voksvibe-about.jpg') }}" alt="Voksvibe Visual" class="w-full h-auto object-contain">
            </div>

            <div class="space-y-6 text-xs md:text-sm font-mono tracking-tight leading-relaxed text-justify">
                <p>
                    <span class="font-bold">VOKSVIBE</span> is a gripping and unconventional clothing brand based in Indonesia. Represents not only a more refined and forward-thinking brand, we reflect our each issues like a musical albums and every articles is like a song we write.
                </p>
                <p>
                    Driven by the dream-quest of local youth culture, living in a cosmos that is indifferent to our existence. VOKSVIBE is dangerous flame of brand that seemed lost for many years and that now once again has been set loose upon everyday society & to decipher the world objectively.
                </p>
                <p>
                    Our first love has always been and will always be music, arts, and subculture movement. We try to give back to our roots through the products and opportunities we provide through the company. We remains extremely involved in the production and direction, maintaining the respect over communities we continue to support.
                </p>
            </div>

        </div>
    </div>

</div>
@endsection